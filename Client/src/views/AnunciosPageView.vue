<template>
    <div class="anuncio-detail-page bg-light">
        <div class="container py-4">
            <!-- Header -->
            <div class="card mb-4 border-0 shadow-sm">
                <div class="card-body d-flex align-items-center gap-3">
                    <router-link to="/" class="btn btn-outline-secondary d-flex align-items-center gap-2">
                        <i class="bi bi-arrow-left"></i>
                        Voltar
                    </router-link>
                    <h1 class="h3 mb-0">Detalhes do Anúncio</h1>
                </div>
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

            <!-- Content -->
            <div v-else class="row g-4">
                <!-- Main Content -->
                <div class="col-lg-9">
                    <div class="card border-0 shadow-sm">
                        <div class="position-relative">
                            <img :src="anuncio.ImagemAnuncio || 'https://via.placeholder.com/500'" 
                                 :alt="anuncio.Nome"
                                 class="card-img-top product-image">
                            <span class="position-absolute top-0 end-0 m-3 badge bg-primary px-3 py-2 rounded-pill">
                                {{ formatPrice(anuncio.Preco) }}
                            </span>
                        </div>

                        <div class="card-body p-4">
                            <!-- Title and User Info -->
                            <div class="mb-4">
                                <h2 class="h3 mb-3 text-primary">{{ anuncio.Nome }}</h2>
                                <div class="d-flex align-items-center gap-3">
                                    <i class="bi bi-person-circle fs-1 text-secondary"></i>
                                    <div>
                                        <h3 class="h6 mb-1">Anunciante #{{ anuncio.IdUtilizadorAnuncio }}</h3>
                                        <p class="mb-0 text-muted small">
                                            <i class="bi bi-geo-alt-fill me-1"></i>
                                            {{ anuncio.LocalRecolha }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Details Grid -->
                            <div class="row g-3 mb-4">
                                <div class="col-md-6" v-for="(detail, index) in details" :key="index">
                                    <div class="p-3 bg-light rounded">
                                        <i :class="detail.icon + ' text-primary me-2'"></i>
                                        <span>{{ detail.label }}: {{ detail.value }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Description -->
                            <div class="mb-4">
                                <h5 class="mb-3">Descrição</h5>
                                <p class="bg-light p-3 rounded">
                                    {{ anuncio.Descricao || 'Sem descrição disponível.' }}
                                </p>
                            </div>

                            <!-- Action Buttons -->
                            <div class="d-flex gap-3">
                                <button class="btn btn-primary flex-grow-1 py-2"
                                        @click="handleReservar"
                                        :disabled="anuncio.IdEstadoAnuncio !== 1">
                                    <i class="bi bi-bag-check me-2"></i>
                                    {{ getReserveButtonText() }}
                                </button>
                                <button class="btn btn-outline-danger" @click="handleReport">
                                    <i class="bi bi-exclamation-triangle me-2"></i>
                                    Denunciar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Similar Items Sidebar -->
                <div class="col-lg-3">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h2 class="h5 mb-3">Outros Anúncios Similares</h2>
                            <div class="d-flex flex-column gap-3">
                                <router-link v-for="item in similarAnuncios" 
                                           :key="item.IdAnuncio"
                                           :to="{ name: 'anuncio-detail', params: { id: item.IdAnuncio }}"
                                           class="text-decoration-none">
                                    <div class="card similar-card h-100">
                                        <div class="position-relative">
                                            <img :src="item.ImagemAnuncio || 'https://via.placeholder.com/500'"
                                                 :alt="item.Nome"
                                                 class="card-img-top similar-image">
                                            <span class="position-absolute top-0 end-0 m-2 badge bg-primary">
                                                {{ formatPrice(item.Preco) }}
                                            </span>
                                        </div>
                                        <div class="card-body">
                                            <h6 class="mb-1 text-dark">{{ item.Nome }}</h6>
                                            <p class="mb-0 text-muted small">
                                                <i class="bi bi-geo-alt-fill me-1"></i>
                                                {{ item.LocalRecolha }}
                                            </p>
                                        </div>
                                    </div>
                                </router-link>
                            </div>
                        </div>
                    </div>
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
            similarAnuncios: [],
            loading: true,
            error: null
        }
    },
    computed: {
        details() {
            if (!this.anuncio) return [];
            return [
                {
                    icon: 'bi bi-calendar-check',
                    label: 'Data de Validade',
                    value: this.formatDate(this.anuncio.DataValidade)
                },
                {
                    icon: 'bi bi-box',
                    label: 'Quantidade',
                    value: this.anuncio.Quantidade
                },
                {
                    icon: 'bi bi-clock',
                    label: 'Horário de Recolha',
                    value: this.anuncio.HorarioRecolha
                },
                {
                    icon: 'bi bi-calendar2',
                    label: 'Data de Recolha',
                    value: this.formatDate(this.anuncio.DataRecolha)
                },
                {
                    icon: 'bi bi-calendar-plus',
                    label: 'Publicado em',
                    value: this.formatDate(this.anuncio.DataAnuncio)
                }
            ];
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
        if (!date) return 'Data não definida';
        return new Date(date).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },
    getReserveButtonText() {
        if (!this.anuncio) return 'Carregando...';
        if (this.anuncio.IdEstadoAnuncio === 2) return 'Já Reservado';
        if (this.anuncio.IdEstadoAnuncio === 3) return 'Expirado';
        return 'Reservar Produto';
    },
    async fetchAnuncio() {
        try {
            this.loading = true;
            const response = await anunciosService.getAnuncioById(this.$route.params.id);
            this.anuncio = response.data;
            await this.fetchSimilarAnuncios();
        } catch (error) {
            this.error = 'Erro ao carregar o anúncio. Por favor, tente novamente.';
            console.error('Error:', error);
        } finally {
            this.loading = false;
        }
    },
    async fetchSimilarAnuncios() {
        try {
            if (!this.anuncio) return;
            const response = await anunciosService.getAllAnuncios(1, 4, {
                categoria: this.anuncio.IdProdutoCategoria,
                exclude: this.anuncio.IdAnuncio
            });
            this.similarAnuncios = response.data;
        } catch (error) {
            console.error('Error fetching similar items:', error);
        }
    },
    async handleReservar() {
        try {
            await anunciosService.updateAnuncio(this.anuncio.IdAnuncio, {
                IdEstadoAnuncio: 2, // Estado reservado
                IdUtilizadorReserva: 1, // Substituir pelo ID do usuário logado
                DataReserva: new Date()
            });
            await this.fetchAnuncio(); // Recarrega os dados
            alert('Produto reservado com sucesso!');
        } catch (error) {
            alert('Erro ao reservar o produto. Por favor, tente novamente.');
            console.error('Error:', error);
        }
    },
    handleReport() {
        // Implementar lógica de denúncia
        alert('Função de denúncia a ser implementada!');
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

.product-image {
    height: 400px;
    object-fit: cover;
}

.similar-image {
    height: 120px;
    object-fit: cover;
}

.similar-card {
    transition: transform 0.2s ease;
}

.similar-card:hover {
    transform: translateY(-3px);
}

@media (max-width: 992px) {
    .product-image {
        height: 300px;
    }
}

@media (max-width: 576px) {
    .product-image {
        height: 200px;
    }
}
</style>