<template>
    <div class="card border-0 shadow-sm">
        <div class="card-body">
            <h2 class="h5 mb-3 fw-bold text-primary">Outros Anúncios Similares</h2>
            <div class="similar-ads-grid">
                <router-link
                    v-for="item in similarAnuncios"
                    :key="item.IdAnuncio"
                    :to="{ name: 'anuncio-detail', params: { id: item.IdAnuncio } }"
                    class="text-decoration-none similar-item"
                >
                    <div class="card border-0 shadow-sm hover-lift">
                        <div class="position-relative similar-image-container">
                            <img
                                :src="item.ImagemAnuncio || 'https://via.placeholder.com/500'"
                                :alt="item.Nome"
                                class="card-img-top similar-image"
                            >
                            <span class="position-absolute top-0 end-0 m-2 badge bg-primary price-badge">
                                {{ formatPrice(item.Preco) }}
                            </span>
                        </div>
                        <div class="card-body d-flex flex-column pt-3 pb-2 px-3">
                            <h6 class="card-title text-dark similar-title fw-semibold mb-2">{{ item.Nome }}</h6>
                            <div class="info-row">
                                <i class="bi bi-geo-alt-fill me-1"></i>
                                <span>{{ item.LocalRecolha }}</span>
                            </div>
                            <div class="info-row">
                                <i class="bi bi-calendar-event me-1"></i>
                                <span>Validade: {{ new Date(item.DataValidade).toLocaleDateString('pt-PT') }}</span>
                            </div>
                            <div class="info-row">
                                <i class="bi bi-calendar-check me-1"></i>
                                <span>Recolha: {{ new Date(item.DataRecolha).toLocaleDateString('pt-PT') }}</span>
                            </div>
                        </div>
                    </div>
                </router-link>
                <div v-if="similarAnuncios.length === 0" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                    Nenhum anúncio similar encontrado.
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { anunciosService } from '@/api/anuncio';

export default {
    name: 'SimilarAds',
    props: {
        currentAnuncioId: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            similarAnuncios: []
        }
    },
    methods: {
        formatPrice(price) {
            return Number(price).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'EUR'
            });
        },
        async fetchSimilarAnuncios() {
            try {
                const response = await anunciosService.getAllAnuncios(1, 4, {
                    exclude: this.currentAnuncioId
                });
                this.similarAnuncios = response.data;
            } catch (error) {
                console.error('Error fetching similar items:', error);
            }
        }
    },
    watch: {
        currentAnuncioId: {
            handler() {
                this.fetchSimilarAnuncios();
            },
            immediate: true
        }
    }
}
</script>

<style scoped>
.similar-ads-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.similar-item {
    display: flex;
    min-height: 0;
}

.card {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 0;
}

.card-body {
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.similar-image-container {
    height: 200px;
    min-height: 160px;
    overflow: hidden;
    background: #f8f9fa;
    border-radius: 0.75rem 0.75rem 0 0;
}

.similar-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.similar-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 1rem;
    line-height: 1.3;
    height: 2.6rem;
    font-weight: 600;
}

.price-badge {
    font-size: 1rem;
    padding: 0.45em 0.9em;
    border-radius: 0.7rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
}

.info-row {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: #6c757d;
    font-size: 0.95rem;
    margin-bottom: 0.2rem;
}

.hover-lift {
    transition: transform 0.2s, box-shadow 0.2s;
}

.hover-lift:hover {
    transform: translateY(-1px) scale(1.01);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    background: #f1f3f6;
}
</style>