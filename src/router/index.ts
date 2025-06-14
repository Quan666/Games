import { createRouter, createWebHistory } from 'vue-router'
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


export default createRouter({
  history: createWebHistory(),
  routes,
})
