<template>
    <div class="profile-page">
        <div class="container py-5 forms">
            <div class="row justify-content-center">
                <!-- Sidebar -->
                <div class="col-lg-3 mb-4 sidebar">
                    <UserSidebar :userDetails="userDetails" :key="userDetails?.ImagemPerfil" />
                </div>

                <!-- Formulário de edição -->
                <div class="col-lg-8">
                    <ProfileForm :userDetails="userDetails" @profile-updated="fetchUserDetails" />
                </div>

                
            </div>
        </div>
    </div>
</template>

<script>
import { utilizadorService } from '@/api/utilizador';
import UserSidebar from '@/components/UserSidebar.vue';
import ProfileForm from '@/components/ProfileForm.vue';

export default {
    name: 'ProfilePageView',
    components: {
        ProfileForm,
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
.profile-page {
    padding-top: 80px;
    min-height: 100vh;
    background-color: #f8f9fa;
}
</style>