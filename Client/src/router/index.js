import { createRouter, createWebHistory } from 'vue-router'
import HomePageView from '../views/HomePageView.vue'
import LoginPageView from '../views/LoginPageView.vue'
import registerPageView from '../views/RegisterPageView.vue'
import AnunciosPageView from '../views/AnunciosPageView.vue'
import ProfilePageView from '../views/ProfilePageView.vue'
import UserAnunciosView from '../views/UserAnunciosView.vue'
import UserReservasView from '../views/UserReservasView.vue'

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
    },
    {
      path: '/anuncio/:id',
      name: 'anuncio-detail',
      component: AnunciosPageView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfilePageView
    },
    {
      path: '/user/anuncios',
      name: 'user-anuncios',
      component: UserAnunciosView
    },
    {
      path: '/user/reservas',
      name: 'user-reservas',
      component: UserReservasView
    },
  ]
})

export default router