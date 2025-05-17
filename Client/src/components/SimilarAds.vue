<template>
    <div class="card border-0 shadow-sm h-100">
        <div class="card-body d-flex flex-column">
            <h2 class="h5 mb-3">Outros Anúncios Similares</h2>
            <div class="flex-grow-1 d-flex flex-column gap-3">
                <router-link v-for="item in similarAnuncios" :key="item.IdAnuncio"
                    :to="{ name: 'anuncio-detail', params: { id: item.IdAnuncio } }"
                    class="text-decoration-none">
                    <div class="card border-0 shadow-sm hover-lift">
                        <div class="position-relative">
                            <img :src="item.ImagemAnuncio || 'https://via.placeholder.com/500'"
                                :alt="item.Nome" class="card-img-top similar-image object-fit-cover">
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
.similar-image {
    height: 160px;
}

.hover-lift {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.hover-lift:hover {
    transform: translateY(-3px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
</style>