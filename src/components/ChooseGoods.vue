<template>
    <el-dialog
        title="商品选择"
        v-model="dialogvisible"
        width="80%"
        destroy-on-close>

        <el-table 
        ref="multipleTableRef" 
        @selection-change="handleSelectionChange" 
        :data="tableData" 
        stripe 
        style="width: 100%" 
        v-loading="loading"
        height="300px">
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品">
          <template #default="{ row }">
            <div class="flex">
              <el-image class="mr-3 rounded" :src="row.cover" fit="cover" :lazy="true" style="width:50px;height: 50px;">
              </el-image>
              <div class="flex-1">
                <p>{{ row.title }}</p>
                <p class="text-gray-400 text-xs mb-1">分类:{{ row.category ? row.category.name : "未分类" }}</p>
                <p class="text-gray-400 text-xs">创建时间：{{ row.create_time }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="总库存" width="90" prop="stock" align="center" />
        <el-table-column label="价格（元）" width="150" align="center">
            <template #default="{ row }">
                <span class="text-rose-500">￥{{ row.min_price }}</span>
                <el-divider direction="vertical"></el-divider>
                <span class=" text-gray-500 text-xs">￥{{ row.min_oprice }}</span>
            </template>
        </el-table-column>
      </el-table>
       <div class="flex items-center justify-center mt-5">
        <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage"
          :page-size="limit" @current-change="getData" />
      </div>
        <template #footer>
            <span>
                <el-button @click="close">取消</el-button>
                <el-button type="primary" @click="submit">确定</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script setup>
import { ref } from "vue"
import {
    getGoodsList
} from "~/api/goods.js"
import { useInitTable } from '~/composables/useCommon.js'
const dialogvisible = ref(false)

const {
  handleSelectionChange,
  multipleTableRef,
  searchForm,
  tableData,
  loading,
  currentPage,
  total,
  limit,
  getData,
  multiSelectionIds
} = useInitTable({
  searchForm: {
    title: "",
    tab: "all",
    category_id: null,
  },
  getList: getGoodsList,
  onGetListSuccess: (res) => {
    tableData.value = res.list
    total.value = res.totalCount
  }
})

function close(){
    dialogvisible.value = false
}

const callbackFunction = ref(null)
const open = (callback = null)=>{
    callbackFunction.value = callback
    dialogvisible.value = true
}

const submit = () => {
  const selection = multipleTableRef.value?.getSelectionRows?.() || []
  const ids = selection.map(item => item.id)

  if (!ids.length) {
    ElMessage.warning("请选择至少一个商品")
    return
  }

  if (typeof callbackFunction.value === "function") {
    callbackFunction.value(ids)  // 这里传回的是数组：[1, 2, 3]
  }

  close()
}
defineExpose({
    open
})

</script>