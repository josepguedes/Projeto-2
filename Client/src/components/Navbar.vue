<script>
import { RouterLink } from "vue-router";
import { utilizadorService } from "@/api/utilizador";

export default {
    name: 'Navbar',
    data() {
        return {
            isAuthenticated: false,
            user: null,
            userDetails: null
        }
    },
    watch: {
        '$route': {
            immediate: true,
            handler() {
                this.checkAuth();
            }
        }
    },
    methods: {
        async checkAuth() {
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    this.user = JSON.parse(jsonPayload);
                    this.isAuthenticated = true;

                    try {
                        const details = await utilizadorService.getUserDetails(this.user.IdUtilizador);
                        this.userDetails = details;
                    } catch (error) {
                        console.error('Error fetching user details:', error);
                    }
                } catch (error) {
                    console.error('Error decoding token:', error);
                    this.logout();
                }
            } else {
                this.isAuthenticated = false;
                this.user = null;
                this.userDetails = null;
            }
        },
        logout() {
            sessionStorage.removeItem('token');
            this.isAuthenticated = false;
            this.user = null;
            this.userDetails = null;
            this.$router.push('/login');
        }
    },
    created() {
        this.checkAuth();
    }
}
</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div class="container">
            <router-link class="navbar-brand text-primary font-weight-bold" :to="{ name: 'home' }">
                FoodShare
            </router-link>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center">
                    <!-- Show this when user is not authenticated -->
                    <li class="nav-item" v-if="!isAuthenticated">
                        <router-link class="nav-link" :to="{ name: 'login' }">Login</router-link>
                    </li>

                    <!-- Show this when user is authenticated -->
                    <li class="nav-item dropdown" v-else>
                        <div class="d-flex align-items-center cursor-pointer" data-bs-toggle="dropdown" role="button">
                            <img :src="userDetails?.ImagemPerfil || 'https://via.placeholder.com/40'" alt="Profile"
                                class="rounded-circle me-2" width="40" height="40">
                            <span class="me-2">{{ userDetails?.Nome || user?.Nome || 'Utilizador' }}</span>
                            <i class="bi bi-chevron-down"></i>
                        </div>

                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <router-link class="dropdown-item" :to="{ name: 'profile' }">
                                    <i class="bi bi-person me-2"></i>Perfil
                                </router-link>
                            </li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li>
                                <a class="dropdown-item text-danger" href="#" @click.prevent="logout">
                                    <i class="bi bi-box-arrow-right me-2"></i>Sair
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: white;
    height: 60px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
    font-size: 1.5rem;
}

.nav-link {
    font-weight: 500;
    transition: color 0.2s ease;
}

.nav-link:hover {
    color: #33A58C !important;
}

.cursor-pointer {
    cursor: pointer;
}

.dropdown-item {
    padding: 0.5rem 1rem;
}

.dropdown-item:active {
    background-color: #33A58C;
}

.dropdown-menu {
    border: none;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
</style>