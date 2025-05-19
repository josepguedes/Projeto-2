<template>
    <div class="card border-0 shadow-sm">
        <div class="card-body position-relative px-4">
            <!-- Rating Summary -->
            <div class="d-flex align-items-center mb-4">
                <div class="display-4 me-3 fw-bold">{{ averageRating.toFixed(1) }}</div>
                <div>
                    <div class="stars mb-2">
                        <template v-for="i in 5" :key="i">
                            <i :class="[
                                'bi',
                                i <= Math.round(averageRating)
                                    ? 'bi-star-fill text-warning'
                                    : 'bi-star text-muted'
                            ]"></i>
                        </template>
                    </div>
                    <div class="text-muted">{{ avaliacoes.length }} avaliações</div>
                </div>
            </div>

            <!-- Carousel -->
            <div id="avaliacoesCarousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">
                    <div class="carousel-item" v-for="(group, index) in groupedAvaliacoes" :key="index"
                        :class="{ active: index === 0 }">
                        <div class="row g-4">
                            <div class="col-md-6" v-for="avaliacao in group" :key="avaliacao.IdAvaliacao">
                                <div class="p-4 bg-light rounded-3 h-100 d-flex flex-column">
                                    <!-- User Info and Rating at Top -->
                                    <div class="d-flex justify-content-between align-items-start mb-3">
                                        <div class="d-flex align-items-center">
                                            <img :src="avaliacao.autor?.ImagemPerfil || 'https://via.placeholder.com/40'"
                                                class="rounded-circle me-2 border" width="40" height="40" alt="Autor">
                                            <div>
                                                <div class="fw-medium">{{ avaliacao.autor?.Nome }}</div>
                                                <small class="text-muted">
                                                    {{ formatDate(avaliacao.DataAvaliacao) }}
                                                </small>
                                            </div>
                                        </div>
                                        <div class="d-flex align-items-center">
                                            <div class="stars me-1">
                                                <template v-for="i in 5" :key="i">
                                                    <i :class="[
                                                        'bi',
                                                        i <= avaliacao.Classificacao
                                                            ? 'bi-star-fill text-warning'
                                                            : 'bi-star text-muted'
                                                    ]"></i>
                                                </template>
                                            </div>
                                            <small class="text-muted">({{ avaliacao.Classificacao }})</small>
                                        </div>
                                    </div>

                                    <!-- Comment Text Below -->
                                    <div class="flex-grow-1">
                                        <p class="mb-0">{{ avaliacao.Comentario }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Carousel Controls -->
                <button v-if="avaliacoes.length > 2" 
                    class="carousel-control carousel-control-prev" 
                    type="button"
                    data-bs-target="#avaliacoesCarousel" 
                    data-bs-slide="prev">
                    <span class="carousel-arrow">
                        <i class="bi bi-chevron-left"></i>
                    </span>
                </button>
                <button v-if="avaliacoes.length > 2" 
                    class="carousel-control carousel-control-next" 
                    type="button"
                    data-bs-target="#avaliacoesCarousel" 
                    data-bs-slide="next">
                    <span class="carousel-arrow">
                        <i class="bi bi-chevron-right"></i>
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { Carousel } from 'bootstrap';

export default {
    name: 'AvaliationsSection',
    props: {
        userId: {
            type: [Number, String],
            required: true
        }
    },
    data() {
        return {
            avaliacoes: [],
            carousel: null
        }
    },
    computed: {
        averageRating() {
            if (!this.avaliacoes.length) return 0;
            const sum = this.avaliacoes.reduce((acc, curr) => acc + curr.Classificacao, 0);
            return sum / this.avaliacoes.length;
        },
        groupedAvaliacoes() {
            const result = [];
            for (let i = 0; i < this.avaliacoes.length; i += 2) {
                result.push(this.avaliacoes.slice(i, i + 2));
            }
            return result;
        }
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        },
        async fetchAvaliacoes() {
            try {
                // Updated to include author information in response
                const response = await fetch(`http://localhost:3000/avaliacoes?idAvaliado=${this.userId}&include=autor`);
                const data = await response.json();
                this.avaliacoes = data.data || [];
            } catch (error) {
                console.error('Erro ao carregar avaliações:', error);
            }
        }
    },
    mounted() {
        this.fetchAvaliacoes();
        this.carousel = new Carousel(document.getElementById('avaliacoesCarousel'), {
            interval: 5000
        });
    },
    beforeUnmount() {
        if (this.carousel) {
            this.carousel.dispose();
        }
    }
}
</script>

<style scoped>
.carousel-control {
    width: 40px;
    height: 40px;
    background-color: #fff;
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    opacity: 1;
    position: absolute;
}

.carousel-control:hover {
    background-color: #f8f9fa;
}

.carousel-control-prev {
    left: -20px;
}

.carousel-control-next {
    right: -20px;
}

.carousel-arrow {
    color: #333;
    font-size: 1.5rem;
    line-height: 1;
}

.stars i {
    font-size: 1rem;
    margin-right: 2px;
}

.carousel-item {
    padding: 1rem;
}

.card-body {
    padding: 2rem;
}

/* Add smooth transitions */
.carousel-item {
    transition: transform 0.6s ease-in-out;
}

.carousel-control {
    transition: all 0.3s ease;
}

.carousel-control:hover {
    transform: translateY(-50%) scale(1.1);
}
</style>