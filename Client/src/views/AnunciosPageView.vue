<template>
    <div class="anuncio-detail-page container py-5">
        <!-- Loading State -->
        <div v-if="loading" class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>

        <!-- Content -->
        <div v-else class="row">
            <!-- Image Column -->
            <div class="col-md-6">
                <img :src="anuncio.ImagemAnuncio || 'https://via.placeholder.com/500'" 
                     :alt="anuncio.Nome"
                     class="img-fluid rounded shadow">
            </div>

            <!-- Details Column -->
            <div class="col-md-6">
                <h1 class="mb-4">{{ anuncio.Nome }}</h1>
                
                <div class="price-badge badge bg-primary fs-4 mb-4">
                    {{ formatPrice(anuncio.Preco) }}
                </div>

                <div class="details-section mb-4">
                    <h5>Detalhes do Anúncio</h5>
                    <ul class="list-unstyled">
                        <li class="mb-2">
                            <i class="bi bi-geo-alt-fill me-2"></i>
                            Local de Recolha: {{ anuncio.LocalRecolha }}
                        </li>
                        <li class="mb-2">
                            <i class="bi bi-clock me-2"></i>
                            Horário de Recolha: {{ anuncio.HorarioRecolha }}
                        </li>
                        <li class="mb-2">
                            <i class="bi bi-calendar me-2"></i>
                            Data de Validade: {{ formatDate(anuncio.DataValidade) }}
                        </li>
                        <li class="mb-2">
                            <i class="bi bi-box me-2"></i>
                            Quantidade: {{ anuncio.Quantidade }}
                        </li>
                    </ul>
                </div>

                <div class="description-section mb-4">
                    <h5>Descrição</h5>
                    <p>{{ anuncio.Descricao || 'Sem descrição disponível.' }}</p>
                </div>

                <button v-if="anuncio.IdEstadoAnuncio === 1" 
                        class="btn btn-primary btn-lg w-100"
                        @click="handleReservar">
                    Reservar Produto
                </button>
                <div v-else class="alert alert-warning">
                    Este produto já não está disponível.
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { anunciosService } from '@/api/anuncio';

export default {
    name: 'AnunciosPageView',
    data() {
        return {
            anuncio: null,
            loading: true,
            error: null
        }
    },
    methods: {
        formatPrice(price) {
            return Number(price).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'EUR'
            });
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        },
        async fetchAnuncio() {
            try {
                this.loading = true;
                const response = await anunciosService.getAnuncioById(this.$route.params.id);
                this.anuncio = response.data;
            } catch (error) {
                this.error = 'Erro ao carregar o anúncio. Por favor, tente novamente.';
                console.error('Error:', error);
            } finally {
                this.loading = false;
            }
        },
        handleReservar() {
            // Implementar lógica de reserva
            alert('Função de reserva a ser implementada!');
        }
    },
    created() {
        this.fetchAnuncio();
    }
}
</script>

<style scoped>
.anuncio-detail-page {
    padding-top: 80px;
    min-height: 100vh;
}

.price-badge {
    padding: 0.5rem 1rem;
    border-radius: 8px;
}

.details-section, .description-section {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
}

.btn-primary {
    padding: 1rem;
    font-size: 1.1rem;
}

img {
    max-height: 500px;
    object-fit: cover;
    width: 100%;
}
</style>