import { createRouter, createWebHistory } from 'vue-router'
import TemperatureChart from '../views/TemperatureChart.vue'
import PrecipitationChart from '../views/PrecipitationChart.vue'
import TopView from '../views/TopView.vue'

const routes = [
  {
    path: '/',
    name: 'TemperatureChart',
    component: TemperatureChart
  },
  {
    path: '/precipitation',
    name: 'PrecipitationChart',
    component: PrecipitationChart
  },
  {
    path: '/topcitta',
    name: 'TopView',
    component: TopView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
