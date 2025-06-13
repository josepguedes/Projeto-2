import { createRouter, createWebHistory } from "vue-router";
import HomePageView from "../views/HomePageView.vue";
import LoginPageView from "../views/LoginPageView.vue";
import registerPageView from "../views/RegisterPageView.vue";
import AnunciosPageView from "../views/AnunciosPageView.vue";
import ProfilePageView from "../views/ProfilePageView.vue";
import UserAnunciosView from "../views/UserAnunciosView.vue";
import UserReservasView from "../views/UserReservasView.vue";
import AdminAnuncios from "../views/admin/AdminAnunciosView.vue";
import AdminUtilizadores from "../views/admin/AdminUsersView.vue";
import AdminAvaliaçoes from "../views/admin/AdminAvaliaçoesView.vue";
import AdminReservas from "../views/admin/AdminReservasView.vue";
import AdminNotificaçoes from "../views/admin/AdminNotificaçoesView.vue";
import AdminDenuncias from "../views/admin/AdminDenunciasView.vue";
import AdminCategorias from "../views/admin/AdminCategoriasView.vue";
import UserBloqueadosView from '../views/UserBloqueiosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomePageView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginPageView,
    },
    {
      path: "/register",
      name: "register",
      component: registerPageView,
    },
    {
      path: "/anuncio/:id",
      name: "anuncio-detail",
      component: AnunciosPageView,
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfilePageView,
    },
    {
      path: "/user/anuncios",
      name: "user-anuncios",
      component: UserAnunciosView,
    },
    {
      path: "/user/reservas",
      name: "user-reservas",
      component: UserReservasView,
    },
    {
      path: "/admin/anuncios",
      name: "admin-anuncios",
      component: AdminAnuncios,
    },
    {
      path: "/admin/utilizadores",
      name: "admin-utilizadores",
      component: AdminUtilizadores,
    },
    {
      path: "/admin/avaliacoes",
      name: "admin-avaliacoes",
      component: AdminAvaliaçoes,
    },
    {
      path: "/admin/reservas",
      name: "admin-reservas",
      component: AdminReservas,
    },
    {
      path: "/admin/notificacoes",
      name: "admin-notificacoes",
      component: AdminNotificaçoes,
    },
    {
      path: "/admin/denuncias",
      name: "admin-denuncias",
      component: AdminDenuncias,
    },
    {
      path: "/admin/categorias",
      name: "admin-categorias",
      component: AdminCategorias,
    },
    {
      path: "/user/bloqueados",
      name: "user-bloqueados",
      component: UserBloqueadosView,
    },
  ],
});

export default router;
