<template>
    <div class="user-sidebar">
        <div class="user-info mb-4">
            <div class="user-avatar">
                <img :src="userDetails?.ImagemPerfil || 'https://via.placeholder.com/100'" alt="Profile"
                    class="rounded-circle">
            </div>
            <h5 class="user-name mt-3 mb-1">Olá, {{ userDetails?.Nome || 'Carregando...' }}</h5>
        </div>

        <div class="navigation">
            <router-link to="/profile" class="nav-item" :class="{ active: currentRoute === 'profile' }" exact>
                <i class="bi bi-person-circle"></i>
                Meu Perfil
            </router-link>

            <router-link to="/user/anuncios" class="nav-item" :class="{ active: currentRoute === 'user-anuncios' }">
                <i class="bi bi-cart3"></i>
                Meus Anúncios
            </router-link>

            <router-link to="/user/reservas" class="nav-item" :class="{ active: currentRoute === 'user-reservas' }">
                <i class="bi bi-bookmark-check"></i>
                Minhas Reservas
            </router-link>

            <router-link to="/" class="nav-item text-danger">
                <i class="bi bi-house-door"></i>
                Sair
            </router-link>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UserSidebar',
    props: {
        userDetails: {
            type: Object,
            required: true
        }
    },
    computed: {
        currentRoute() {
            return this.$route.name;
        }
    }
}
</script>

<style scoped>
.user-sidebar {
    padding-top: 100px !important;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 270px;
    border-radius: 0 1rem 1rem 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.user-info {
    text-align: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
}

.user-avatar {
    width: 100px;
    height: 100px;
    margin: 0 auto;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 3px solid #fff;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.navigation {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1.5rem;
}

.nav-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: #6c757d;
    text-decoration: none;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
}

.nav-item i {
    margin-right: 0.75rem;
    font-size: 1.2rem;
}

.nav-item:hover {
    background-color: #f8f9fa;
    color: #33A58C;
}

.nav-item.active {
    background-color: #e8f7f3;
    color: #33A58C;
    font-weight: 500;
}

.nav-item.text-danger:hover {
    background-color: #fee2e2;
    color: #dc3545;
}
</style>