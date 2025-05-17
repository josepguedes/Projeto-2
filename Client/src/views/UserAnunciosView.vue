<template>
    <div class="anuncios-page">
        <div class="container py-5 forms">
            <div class="row">
                <!-- Sidebar -->
                <div class="col-lg-3 mb-4 sidebar">
                    <UserSidebar :userDetails="userDetails" />
                </div>

                <!-- Conteúdo principal -->
                <div class="col-lg-8">
                    <h2 class="mb-4">Meus Anúncios</h2>
                    <!-- Adicione aqui o conteúdo das reservas -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { utilizadorService } from '@/api/utilizador';
import UserSidebar from '@/components/UserSidebar.vue';

export default {
    name: 'UserAnunciosView',
    components: {
        UserSidebar
    },
    data() {
        return {
            userDetails: null
        }
    },
    methods: {
        async fetchUserDetails() {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    this.$router.push('/login');
                    return;
                }

                const payload = JSON.parse(atob(token.split('.')[1]));
                const userDetails = await utilizadorService.getUserDetails(payload.IdUtilizador);
                this.userDetails = userDetails;
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        }
    },
    created() {
        this.fetchUserDetails();
    }
}
</script>

<style scoped>
.anuncios-page {
    padding-top: 80px;
    min-height: 100vh;
    background-color: #f8f9fa;
}

.forms {
    margin-top: 20px;
}

h2 {
    color: #333;
    font-weight: 600;
}
</style>