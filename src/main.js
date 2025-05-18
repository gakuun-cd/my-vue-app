import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 引入样式
import {router} from './router'
import store from './store'
const app = createApp(App)
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

app.use(store)
app.use(router)

// 使用 Element Plus 插件
app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

import 'virtual:windi.css'
import "./permission"
import "nprogress/nprogress.css"
app.mount('#app')