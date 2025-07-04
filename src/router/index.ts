import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Gomoku from '../components/gomoku/Gomoku.vue'
import ChessEntry from '../components/chess/ChessEntry.vue'

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
  {
    path: '/chess',
    name: 'Chess',
    component: ChessEntry,
  },
]

export default createRouter({
  history: createWebHistory(),
  // 如果需要使用 hash 模式，可以切换到下面这行
  // history: createWebHashHistory(),
  routes,
})
