import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Gomoku from '../components/gomoku/Gomoku.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/wuziqi',
    name: 'Gomoku',
    component: Gomoku,
  },
]

// 根据环境变量选择路由模式
const isHashMode = import.meta.env.VITE_ROUTER_MODE.trim().toUpperCase() === 'HASH'

export default createRouter({
  history: isHashMode ? createWebHashHistory() : createWebHistory(),
  routes,
})
