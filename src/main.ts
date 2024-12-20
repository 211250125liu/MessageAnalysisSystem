import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.ts'
import ElementPlus from "element-plus";
let app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
