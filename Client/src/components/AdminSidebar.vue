<template>
    <div class="user-sidebar">
        <div class="user-info mb-4">
            <div class="user-avatar">
                <img :src="userDetails?.ImagemPerfil || 'https://via.placeholder.com/100'" alt="Profile"
                    class="rounded-circle">
            </div>
            <h5 class="user-name mt-3 mb-1">Olá, {{ userDetails?.Nome || 'Carregando...' }}</h5>
            <span class="badge bg-primary">Administrador</span>
        </div>

        <div class="navigation">
            <router-link to="/admin/utilizadores" class="nav-item" :class="{ active: currentRoute === 'admin-utilizadores' }">
                <i class="bi bi-people"></i>
                Gestão de Utilizadores
            </router-link>
            <router-link to="/admin/anuncios" class="nav-item" :class="{ active: currentRoute === 'admin-anuncios' }">
                <i class="bi bi-bag"></i>
                Gestão de Anúncios
            </router-link>
            <router-link to="/admin/denuncias" class="nav-item" :class="{ active: currentRoute === 'admin-denuncias' }">
                <i class="bi bi-shield"></i>
                Gestão de Denúncias
            </router-link>
            <router-link to="/admin/avaliacoes" class="nav-item" :class="{ active: currentRoute === 'admin-avaliacoes' }">
                <i class="bi bi-star"></i>
                Gestão de Avaliações
            </router-link>
            <router-link to="/admin/reservas" class="nav-item" :class="{ active: currentRoute === 'admin-reservas' }">
                <i class="bi bi-calendar-check"></i>
                Gestão de Reservas
            </router-link>
            <router-link to="/admin/notificacoes" class="nav-item" :class="{ active: currentRoute === 'admin-notificacoes' }">
                <i class="bi bi-bell"></i>
                Gestão de Notificações
            </router-link>
            <router-link to="/admin/categorias" class="nav-item" :class="{ active: currentRoute === 'admin-categorias' }">
                <i class="bi bi-tags"></i>
                Gestão de Categorias
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
    name: 'AdminSidebar',
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
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    margin-top: 50px;
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

.user-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
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

.nav-item.active {
    background-color: #e8f7f3;
    color: #33A58C;
    font-weight: 500;
}

.nav-item:hover {
    background-color: #f8f9fa;
    color: #33A58C;
}

.nav-item.text-danger:hover {
    background-color: #fee2e2;
    color: #dc3545;
}
</style>