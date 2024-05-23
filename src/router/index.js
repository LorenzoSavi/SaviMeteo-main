import { createRouter, createWebHistory } from 'vue-router'
import TemperatureChart from '../views/TemperatureChart.vue'
import PrecipitationChart from '../views/PrecipitationChart.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
