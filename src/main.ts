import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import store from './store/index'
import router from './router'
import './styles/dark/css-vars.css'

// vuex
const app = createApp(App)
app.use(store)
// router
app.use(router)
app.mount('#app')
