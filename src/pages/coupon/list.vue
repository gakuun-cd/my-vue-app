<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData"/>

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column label="优惠券名称" width="350">
        <template #default="{ row }">
          <div class="border border-dashed py-2 px-4 rounded" :class="row.statusText == '领取中' ? 'active' : 'inactive'">
            <h5 class="font-bold text-md">{{ row.name }}</h5>
            <small>{{ row.start_time }} ~ {{ row.end_time }}</small>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="statusText" label="状态" />
      <el-table-column label="优惠">
        <template #default="{ row }">
          {{ row.type == 0 ? "满减" : "折扣" }} {{ row.type == 0 ? ("￥"+row.value) : (row.value + "折") }}
        </template>
      </el-table-column>
      <el-table-column prop="total" label="发放数量"/>
      <el-table-column prop="used" label="已使用"/>
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button v-if="scope.row.statusText == '未开始'" type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>

          <el-popconfirm v-if="scope.row.statusText != '领取中'" title="是否要删除该优惠券？" confirmButtonText="确认" cancelButtonText="取消"
            @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button text type="primary" size="small">删除</el-button>
            </template>
          </el-popconfirm>

          <el-popconfirm v-if="scope.row.statusText == '领取中'" title="是否要让该优惠券失效？" confirmButtonText="失效" cancelButtonText="取消"
            @confirm="handleStatusChange(0,scope.row)">
            <template #reference>
              <el-button type="danger" size="small">失效</el-button>
            </template>
          </el-popconfirm>

        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit"
        @current-change="getData" />
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="form.name" placeholder="优惠券名称" style="width: 50%;"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="0">满减</el-radio>
            <el-radio :label="1">折扣</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="面值" prop="value">
          <el-input v-model="form.value" placeholder="面值" style="width: 50%;">
            <template #append>{{ form.type ? "折" : "元" }}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="发行量" prop="total">
          <el-input-number v-model="form.total"
            :min="0" :max="10000"></el-input-number>
        </el-form-item>
        <el-form-item label="最低使用价格" prop="min_price">
          <el-input v-model="form.min_price" placeholder="最低使用价格" type="number"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="form.order"
            :min="0" :max="1000"></el-input-number>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            :editable="false"
            v-model="timerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetimerange"
            range-separator="To"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="form.desc" placeholder="描述" type="textarea" :rows="5"></el-input>
        </el-form-item>
      </el-form>
    </FormDrawer>

  </el-card>
</template>
<script setup>
import { computed } from "vue"
import ListHeader from "~/components/ListHeader.vue";
import FormDrawer from "~/components/FormDrawer.vue";
import {
  getCouponList,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  updateCouponStatus
} from "~/api/coupon"
import { useInitTable, useInitForm } from '~/composables/useCommon.js'

function formatStatus(row){
  let s = "领取中"
  let start_time = (new Date(row.start_time)).getTime()
  let now = (new Date()).getTime()
  let end_time = (new Date(row.end_time)).getTime()
  if(start_time > now){
    s = "未开始"
  } else if(end_time < now){
    s = "已结束"
  } else if(row.status == 0){
    s = "已失效"
  }
  return s
}

const {
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  handleDelete,
  handleStatusChange
} = useInitTable({
  getList: getCouponList,

  onGetListSuccess:(res)=>{
    tableData.value = res.list.map(o=>{
      // 转化优惠券状态
      o.statusText = formatStatus(o)
      return o
    })
    total.value = res.totalCount
  },
  delete: deleteCoupon,
  updateStatus:updateCouponStatus
})

const {
  formDrawerRef,
  formRef,
  form,
  rules,
  drawerTitle,
  handleSubmit,
  handleCreate,
  handleEdit
} = useInitForm({
  form: {
    name:"",
    type:0,
    value:0,
    total:100,
    min_price:0,
    start_time:null,
    end_time:null,
    order:50,
    desc:""
  },
  getData,
  update: updateCoupon,
  create: createCoupon,

  beforeSubmit:(f)=>{
    if(typeof f.start_time != "number"){
      f.start_time = (new Date(f.start_time)).getTime()
    }
    if(typeof f.end_time != "number"){
      f.end_time = (new Date(f.end_time)).getTime()
    }
    return f
  }
})

const timerange = computed({
  get(){
    return form.start_time && form.end_time ? [form.start_time,form.end_time] : []
  },
  set(val){
    form.start_time = val[0]
    form.end_time = val[1]
  }
})
</script>
<style scoped>
.active {
  @apply border-rose-200 bg-rose-50 text-red-400;
}

.inactive {
  @apply border-gray-200 bg-gray-50 text-gray-400;
}
</style>