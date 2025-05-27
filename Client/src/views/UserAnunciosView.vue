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
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>Meus Anúncios</h2>
                        <router-link to="/criar-anuncio" class="btn btn-primary">
                            <i class="bi bi-plus-lg me-2"></i>Criar Anúncio
                        </router-link>
                    </div>

                    <!-- Loading State -->
                    <div v-if="loading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Carregando...</span>
                        </div>
                    </div>

                    <!-- Error State -->
                    <div v-else-if="error" class="alert alert-danger" role="alert">
                        {{ error }}
                    </div>

                    <!-- No Anúncios State -->
                    <div v-else-if="anuncios.length === 0" class="text-center py-5">
                        <i class="bi bi-clipboard-x display-1 text-muted"></i>
                        <p class="mt-3 text-muted">Você ainda não possui anúncios publicados.</p>
                        <router-link to="/criar-anuncio" class="btn btn-primary mt-3">
                            Criar Meu Primeiro Anúncio
                        </router-link>
                    </div>

                    <!-- Anúncios List -->
                    <div v-else class="row g-4">
                        <div v-for="anuncio in anuncios" :key="anuncio.IdAnuncio" class="col-md-6">
                            <div class="card h-100 border-0 shadow-sm">
                                <img :src="anuncio.ImagemAnuncio || 'https://via.placeholder.com/300'" 
                                     :alt="anuncio.Nome"
                                     class="card-img-top"
                                     style="height: 200px; object-fit: cover;">
                                <div class="card-body">
                                    <h5 class="card-title">{{ anuncio.Nome }}</h5>
                                    <p class="card-text text-muted">{{ anuncio.LocalRecolha }}</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="badge" :class="getStatusClass(anuncio.IdEstadoAnuncio)">
                                            {{ getStatusText(anuncio.IdEstadoAnuncio) }}
                                        </span>
                                        <span class="fw-bold">{{ formatPrice(anuncio.Preco) }}</span>
                                    </div>
                                </div>
                                <div class="card-footer bg-white border-0">
                                    <div class="d-flex gap-2">
                                        <router-link :to="`/anuncios/${anuncio.IdAnuncio}`" 
                                                   class="btn btn-outline-primary flex-grow-1">
                                            Ver Detalhes
                                        </router-link>
                                        <button @click="deleteAnuncio(anuncio.IdAnuncio)" 
                                                class="btn btn-outline-danger">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { utilizadorService } from '@/api/utilizador';
import { anunciosService } from '@/api/anuncio';
import UserSidebar from '@/components/UserSidebar.vue';

export default {
    name: 'UserAnunciosView',
    components: {
        UserSidebar
    },
    data() {
        return {
            userDetails: null,
            anuncios: [],
            loading: true,
            error: null
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
                await this.fetchAnuncios(userDetails.IdUtilizador);
            } catch (error) {
                console.error('Error fetching user details:', error);
                this.error = 'Erro ao carregar dados do usuário';
            }
        },
        async fetchAnuncios(userId) {
            try {
                this.loading = true;
                const response = await anunciosService.getUserAnuncios(userId);
                this.anuncios = response.data;
            } catch (error) {
                console.error('Error fetching anuncios:', error);
                this.error = 'Erro ao carregar anúncios';
            } finally {
                this.loading = false;
            }
        },
        formatPrice(price) {
            return Number(price).toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR'
            });
        },
        getStatusClass(status) {
            const classes = {
                1: 'bg-success',    // Disponível
                2: 'bg-warning',    // Reservado
                3: 'bg-secondary',  // Expirado
                4: 'bg-danger',     // Cancelado
                5: 'bg-info'        // Concluído
            };
            return classes[status] || 'bg-secondary';
        },
        getStatusText(status) {
            const texts = {
                1: 'Disponível',
                2: 'Reservado',
                3: 'Expirado',
                4: 'Cancelado',
                5: 'Concluído'
            };
            return texts[status] || 'Desconhecido';
        },
        async deleteAnuncio(id) {
            if (confirm('Tem certeza que deseja excluir este anúncio?')) {
                try {
                    await anunciosService.deleteAnuncio(id);
                    this.anuncios = this.anuncios.filter(a => a.IdAnuncio !== id);
                } catch (error) {
                    console.error('Error deleting anuncio:', error);
                    alert('Erro ao excluir anúncio');
                }
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