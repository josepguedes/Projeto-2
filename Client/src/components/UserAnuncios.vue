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
                        <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                            <button
                                class="btn btn-outline-primary flex-fill d-flex align-items-center justify-content-center"
                                @click="$emit('view-details', anuncio)">
                                <i class="bi bi-eye me-1"></i>
                                <span class="d-none d-md-inline">Ver Detalhes</span>
                            </button>
                            <button
                                class="btn btn-outline-primary flex-fill d-flex align-items-center justify-content-center"
                                @click="$emit('confirm-code', anuncio.IdAnuncio)">
                                <span class="d-none d-md-inline">Confirmar Código</span>
                            </button>
                            <button
                                class="btn btn-outline-secondary flex-fill d-flex align-items-center justify-content-center"
                                @click="$emit('edit', anuncio)">
                                <i class="bi bi-pencil me-1"></i>
                                <span class="d-none d-md-inline">Editar</span>
                            </button>
                            <button
                                class="btn btn-outline-danger flex-fill d-flex align-items-center justify-content-center"
                                @click="$emit('delete', anuncio.IdAnuncio)">
                                <i class="bi bi-trash"></i>
                                <span class="d-none d-md-inline">Eliminar</span>
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
            if (Number(price) === 0) return 'Grátis';
            return Number(price).toLocaleString('pt-BR', {
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
                1: 'Ativo',
                2: 'Reservado',
                3: 'Finalizado',
                4: 'Cancelado',
                5: 'Expirado',
                6: 'Por Pagar'
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
    object-fit: contain !important;
    background: #f8f9fa;
    transition: transform 0.2s;
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

.card-footer .btn {
    min-width: 0;
    flex: 1 1 0;
    white-space: nowrap;
    font-size: 1rem;
    padding: 0.5rem 0.5rem;
    transition: background 0.2s, color 0.2s;
}

.card-footer .btn i {
    font-size: 1.1rem;
}
</style>
