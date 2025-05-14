<script>
import { RouterLink } from "vue-router";

export default {
    name: 'Navbar'
}
</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div class="container">
            <router-link class="navbar-brand text-primary font-weight-bold" :to="{ name: 'home' }">FoodShare</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <router-link class="nav-link" :to="{ name: 'login' }">Login</router-link>
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
    height: 60px; /* Altura fixa para a navbar */
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
    color: #007bff !important;
}
</style>