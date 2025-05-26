<template>
    <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
            <h2 class="h5 mb-3">Outros Anúncios Similares</h2>
            <div class="similar-ads-grid">
                <router-link v-for="item in similarAnuncios" 
                    :key="item.IdAnuncio"
                    :to="{ name: 'anuncio-detail', params: { id: item.IdAnuncio } }"
                    class="text-decoration-none similar-item">
                    <div class="card border-0 shadow-sm h-100 hover-lift">
                        <div class="position-relative similar-image-container">
                            <img :src="item.ImagemAnuncio || 'https://via.placeholder.com/500'"
                                :alt="item.Nome" 
                                class="card-img-top similar-image">
                            <span class="position-absolute top-0 end-0 m-2 badge bg-primary">
                                {{ formatPrice(item.Preco) }}
                            </span>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h6 class="card-title mb-2 text-dark similar-title">{{ item.Nome }}</h6>
                            <p class="card-text text-muted small mb-0 mt-auto">
                                <i class="bi bi-geo-alt-fill me-1"></i>
                                {{ item.LocalRecolha }}
                            </p>
                        </div>
                    </div>
                </router-link>
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
    height: 100%;
}

.similar-item {
    flex: 1 1 0;
    display: flex;
    min-height: 0;
}

.card {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
}

.card-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
}

.similar-image-container {
    height: 200px;
    min-height: 160px;
    overflow: hidden;
}

.similar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.similar-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 0.9rem;
    line-height: 1.4;
    height: 2.8rem;
}

.hover-lift {
    transition: transform 0.2s, box-shadow 0.2s;
    height: 100%;
}

.hover-lift:hover {
    transform: translateY(-3px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
</style>