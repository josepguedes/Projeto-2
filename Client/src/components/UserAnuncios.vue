<!-- components/AnuncioList.vue -->
<template>
    <div>
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
        </div>

        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>

        <div v-else-if="anuncios.length === 0" class="text-center py-5">
            <i class="bi bi-clipboard-x display-1 text-muted"></i>
            <p class="mt-3 text-muted">Você ainda não possui anúncios publicados.</p>
            <router-link to="/criar-anuncio" class="btn btn-primary mt-3">
                Criar Meu Primeiro Anúncio
            </router-link>
        </div>

        <div v-else class="row g-4 justify-content-start">
            <div v-for="anuncio in anuncios" :key="anuncio.IdAnuncio" class="col-md-6 announcement-card">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-img-wrapper">
                        <img :src="anuncio.ImagemAnuncio || 'https://via.placeholder.com/300'" :alt="anuncio.Nome"
                            class="card-img-top">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title text-truncate">{{ anuncio.Nome }}</h5>
                        <p class="card-text text-muted mb-3">
                            <i class="bi bi-geo-alt me-1"></i>
                            {{ anuncio.LocalRecolha }}
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge" :class="getStatusClass(anuncio.IdEstadoAnuncio)">
                                {{ getStatusText(anuncio.IdEstadoAnuncio) }}
                            </span>
                            <span class="price">{{ formatPrice(anuncio.Preco) }}</span>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-0">
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary" @click="$emit('view-details', anuncio)">
                                <i class="bi bi-eye me-1"></i>
                                Ver Detalhes
                            </button>
                            <button @click="$emit('delete', anuncio.IdAnuncio)" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        anuncios: Array,
        loading: Boolean,
        error: String
    },
    methods: {
        formatPrice(price) {
            return Number(price).toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR'
            });
        },
        getStatusClass(status) {
            const classes = {
                1: 'bg-success',
                2: 'bg-warning',
                3: 'bg-secondary',
                4: 'bg-danger',
                5: 'bg-info'
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
        }
    }
}
</script>

<style scoped>
.announcement-card {
    max-width: 370px;
    min-width: 300px;
    margin-bottom: 1.5rem;
}

.card-img-wrapper {
    width: 100%;
    height: 220px;
    overflow: hidden;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-img-top {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s;
}

.card-img-top:hover {
    transform: scale(1.04);
}

.card-title {
    font-size: 1.25rem;
    font-weight: 600;
}

.price {
    font-size: 1.1rem;
    font-weight: 500;
    color: #198754;
}
</style>
