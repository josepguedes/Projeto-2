import { createRouter, createWebHistory } from 'vue-router'
import HomePageView from '../views/HomePageView.vue'
import LoginPageView from '../views/LoginPageView.vue'
import registerPageView from '../views/RegisterPageView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePageView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPageView
    },
    {
      path: '/register',
      name: 'register',
      component: registerPageView
    }
  ]
})

export default router