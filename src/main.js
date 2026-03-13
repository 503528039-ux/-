import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css' // <--- 确保这一行存在！

const app = createApp(App)

app.use(createPinia())
app.mount('#app')