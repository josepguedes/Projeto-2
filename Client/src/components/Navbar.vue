<script>
import { RouterLink } from "vue-router";
import { utilizadorService } from "@/api/utilizador";
import MessagesSidebar from './MessagesSidebar.vue';
import NotificationsBox from './NotificationsBox.vue';

export default {
    name: 'Navbar',
    components: {
        MessagesSidebar,
        NotificationsBox,
    },
    data() {
        return {
            isAuthenticated: false,
            user: null,
            userDetails: null,
            isMessageSidebarOpen: false,
            unreadMessages: 0,
            isAdmin: false,
            isNotificationBoxOpen: false,
            unreadMessages: 0
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
                    await this.fetchUserDetails();
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
        async fetchUserDetails() {
            try {
                if (this.user?.IdUtilizador) {
                    const details = await utilizadorService.getUserDetails(this.user.IdUtilizador);
                    this.userDetails = details;
                    this.isAdmin = this.userDetails?.Funcao === 'admin'; // Verifica se o utilizador é admin
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        },
        async markNotificationsAsRead() {
            try {
                await notificacoesService.marcarTodasComoLidas();
                this.userDetails.NotificacoesNaoLidas = 0; // Atualiza o estado local
            } catch (error) {
                console.error('Erro ao marcar notificações como lidas:', error);
            }
        },
        handleClickOutside(event) {
            const navbar = this.$refs.navbar;
            if (!navbar) {
                console.warn('Navbar ref não está definido.');
                return;
            }

            const notificationsBox = navbar.querySelector('.notifications-wrapper');
            const toggleButton = navbar.querySelector('.notifications-toggle');

            if (notificationsBox && toggleButton) {
                if (!notificationsBox.contains(event.target) && !toggleButton.contains(event.target)) {
                    this.closeNotificationBox();
                }
            }
        },
        logout() {
            sessionStorage.removeItem('token');
            this.isAuthenticated = false;
            this.user = null;
            this.userDetails = null;
            window.dispatchEvent(new CustomEvent('auth-changed')); // Emitir evento no logout
            this.$router.push('/login');
        },
        toggleMessagesSidebar() {
            this.isMessageSidebarOpen = !this.isMessageSidebarOpen;
        },
        closeMessagesSidebar() {
            this.isMessageSidebarOpen = false;
        },
        toggleNotificationBox() {
            this.isNotificationBoxOpen = !this.isNotificationBoxOpen;
        },
        closeNotificationBox() {
            this.isNotificationBoxOpen = false;
        },
    },
    created() {
        this.checkAuth(); // Verificação inicial

        window.addEventListener('open-messages', (event) => {
            this.isMessageSidebarOpen = true;
            // Aqui você pode adicionar lógica para abrir a conversa específica
        });

        // Listener para mudanças de autenticação
        window.addEventListener('auth-changed', () => {
            this.checkAuth();
        });

        window.addEventListener('notifications-updated', this.updateUnreadNotifications);

        // Listener para atualizações do perfil
        window.addEventListener('profile-updated', this.fetchUserDetails);
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        // Remover todos os listeners
        window.removeEventListener('auth-changed', this.checkAuth);
        window.removeEventListener('profile-updated', this.fetchUserDetails);
        document.removeEventListener('click', this.handleClickOutside);
        window.removeEventListener('open-messages');
    }
}
</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm" ref="navbar">
        <div class="container">
            <router-link class="navbar-brand text-primary font-weight-bold" :to="{ name: 'home' }">
                FoodShare
            </router-link>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center">
                    <!-- Quando não autenticado -->
                    <li class="nav-item" v-if="!isAuthenticated">
                        <router-link class="nav-link" :to="{ name: 'login' }">Login</router-link>
                    </li>

                    <!-- Quando autenticado -->
                    <template v-else>
                        <li class="nav-item dropdown">
                            <div class="d-flex align-items-center">
                                <!-- Notificações -->
                                <div class="notifications-wrapper">
                                    <button id="notification-icon-toggler"
                                        class="btn btn-link nav-link me-2 position-relative notifications-toggle"
                                        @click="toggleNotificationBox" title="Notificações">
                                        <i class="bi bi-bell fs-5"></i>
                                        <span v-if="userDetails?.NotificacoesNaoLidas > 0"
                                            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                            style="font-size: 0.7rem;">
                                            {{ userDetails.NotificacoesNaoLidas }}
                                        </span>
                                    </button>
                                    <NotificationsBox v-if="isNotificationBoxOpen" :isOpen="isNotificationBoxOpen"
                                        @close="closeNotificationBox" @mark-read="markNotificationsAsRead" />
                                </div>

                                <!-- Mensagens -->
                                <button class="btn btn-link nav-link me-3" @click="toggleMessagesSidebar">
                                    <i class="bi bi-chat-left fs-5"></i>
                                </button>

                                <!-- Menu Utilizador -->
                                <div class="d-flex align-items-center cursor-pointer" data-bs-toggle="dropdown"
                                    role="button">
                                    <img :src="userDetails?.ImagemPerfil || 'https://via.placeholder.com/40'"
                                        alt="Profile" class="rounded-circle me-2" width="40" height="40">
                                    <span class="me-2">{{ userDetails?.Nome || user?.Nome || 'Utilizador' }}</span>
                                    <i class="bi bi-chevron-down"></i>
                                </div>

                                <ul class="dropdown-menu dropdown-menu-end">
                                    <!-- Link Perfil -->
                                    <li>
                                        <router-link class="dropdown-item" :to="{ name: 'profile' }">
                                            <i class="bi bi-person me-2"></i>Meu Perfil
                                        </router-link>
                                    </li>

                                    <!-- Apenas para administradores -->
                                    <template v-if="isAdmin">
                                        <li>
                                            <router-link class="dropdown-item" :to="{ name: 'admin-utilizadores' }">
                                                <i class="bi bi-people me-2"></i>Painel Admin
                                            </router-link>
                                        </li>
                                        <li>
                                            <hr class="dropdown-divider">
                                        </li>
                                    </template>

                                    <!-- Sair -->
                                    <li>
                                        <a class="dropdown-item text-danger" href="#" @click.prevent="logout">
                                            <i class="bi bi-box-arrow-right me-2"></i>Sair
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Barra lateral de mensagens -->
    <MessagesSidebar :isOpen="isMessageSidebarOpen" @close="closeMessagesSidebar" />
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

.notifications-wrapper {
    position: relative;
}

.notifications-toggle {
    z-index: 1001;
}

.notifications-box {
    position: absolute;
    top: 100%;
    right: 0;
    width: 400px;
    z-index: 1000;
    margin-top: 0.5rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-menu {
    border: none;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
</style>