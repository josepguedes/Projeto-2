<template>
    <div class="anuncios-page">
        <div class="container py-5 forms">
            <div class="row">
                <div class="col-lg-3 mb-4 sidebar">
                    <UserSidebar :userDetails="userDetails" />
                </div>
                <div class="col-lg-8">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>Meus Anúncios</h2>
                        <button class="btn btn-primary" @click="openCreateModal">
                            <i class="bi bi-plus-lg me-2"></i>Criar Anúncio
                        </button>
                    </div>

                    <AnuncioList :anuncios="anuncios" :loading="loading" :error="error" @delete="deleteAnuncio"
                        @view-details="openDetails" />
                </div>
            </div>
        </div>

        <!-- Modal de Detalhes -->
        <UserAnuncioDetails v-if="selectedAnuncio" :anuncio="selectedAnuncio" :show="showDetails"
            @close="closeDetails" />

        <!-- Modal Criar Anúncio -->
        <CreateAnuncio v-if="showCreate" @close="closeCreate" @created="handleAnuncioCriado" />
    </div>
</template>

<script>
import UserSidebar from '@/components/UserSidebar.vue';
import UserAnuncioDetails from '@/components/UserAnuncioDetails.vue';
import CreateAnuncio from '@/components/CreateAnuncio.vue';
import AnuncioList from '@/components/UserAnuncios.vue';
import { utilizadorService } from '@/api/utilizador';
import { anunciosService } from '@/api/anuncio';

export default {
    name: 'UserAnunciosView',
    components: {
        UserSidebar,
        AnuncioList,
        UserAnuncioDetails,
        CreateAnuncio
    },
    data() {
        return {
            userDetails: null,
            anuncios: [],
            loading: true,
            error: null,
            selectedAnuncio: null,
            showDetails: false,
            showCreate: false
        }
    },
    methods: {
        async fetchUserDetails() {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) return this.$router.push('/login');
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.userDetails = await utilizadorService.getUserDetails(payload.IdUtilizador);
                await this.fetchAnuncios(this.userDetails.IdUtilizador);
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                this.error = 'Erro ao carregar dados do usuário';
            }
        },
        async fetchAnuncios(userId) {
            try {
                this.loading = true;
                const response = await anunciosService.getUserAnuncios(userId);
                this.anuncios = response.data;
            } catch (error) {
                console.error('Erro ao carregar anúncios:', error);
                this.error = 'Erro ao carregar anúncios';
            } finally {
                this.loading = false;
            }
        },
        async deleteAnuncio(id) {
            if (confirm('Tem certeza que deseja excluir este anúncio?')) {
                try {
                    await anunciosService.deleteAnuncio(id);
                    this.anuncios = this.anuncios.filter(a => a.IdAnuncio !== id);
                } catch (error) {
                    console.error('Erro ao excluir anúncio:', error);
                    alert('Erro ao excluir anúncio');
                }
            }
        },
        openDetails(anuncio) {
            this.selectedAnuncio = anuncio;
            this.showDetails = true;
        },
        closeDetails() {
            this.selectedAnuncio = null;
            this.showDetails = false;
        },
        openCreateModal() {
            this.showCreate = true;
        },

        closeCreate() {
            this.showCreate = false;
        },
        async handleAnuncioCriado() {
            this.closeCreate();
            await this.fetchAnuncios(this.userDetails.IdUtilizador);
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
    margin-top: 0;
}

.sidebar {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-height: 100%;
}

@media (max-width: 991.98px) {
    .sidebar {
        margin-bottom: 2rem;
    }

    .col-lg-3 {
        margin-bottom: 2rem;
    }
}

h2 {
    color: #333;
    font-weight: 600;
}

.reservas-page {
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