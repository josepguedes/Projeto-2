<template>
    <div class="anuncio-detail-page bg-light min-vh-100 pt-5">
        <div class="container py-4">
            <!-- Header -->
            <router-link to="/" class="btn btn-link text-decoration-none mb-4 d-inline-flex align-items-center">
                <i class="bi bi-arrow-left me-2"></i>
                Voltar ao Menu Principal
            </router-link>

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
            <div v-else class="row">
                <!-- Main Content -->
                <div class="col-lg-8 mb-4">
                    <div class="card border-0 shadow-sm">
                        <div class="position-relative">
                            <img :src="anuncio.ImagemAnuncio || 'https://via.placeholder.com/500'" :alt="anuncio.Nome"
                                class="card-img-top product-image object-fit-cover">
                            <span
                                class="position-absolute top-0 end-0 m-3 badge bg-primary px-3 py-2 rounded-pill fs-5">
                                {{ formatPrice(anuncio.Preco) }}
                            </span>
                        </div>

                        <div class="card-body p-4">
                            <!-- Title and User Info -->
                            <div class="mb-4">
                                <h2 class="h3 mb-3 text-primary">{{ anuncio.Nome }}</h2>
                                <div class="d-flex align-items-center gap-3 bg-light p-3 rounded">
                                    <img :src="anuncio.utilizador?.ImagemPerfil || 'https://via.placeholder.com/50'"
                                        alt="Profile" class="rounded-circle profile-image">
                                    <div>
                                        <h3 class="h6 mb-1">{{ anuncio.utilizador?.Nome || `Anunciante
                                            #${anuncio.IdUtilizadorAnuncio}` }}</h3>
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
                                    <div class="p-3 bg-light rounded d-flex align-items-center">
                                        <i :class="detail.icon + ' text-primary me-2 fs-5'"></i>
                                        <span>{{ detail.label }}: {{ detail.value }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Description -->
                            <div class="mb-4">
                                <h5 class="mb-3">Descrição</h5>
                                <p class="bg-light p-3 rounded mb-0">
                                    {{ anuncio.Descricao || 'Sem descrição disponível.' }}
                                </p>
                            </div>

                            <!-- Action Buttons -->
                            <div class="d-flex gap-3">
                                <button
                                    class="btn btn-primary btn-lg flex-grow-1 d-flex align-items-center justify-content-center"
                                    @click="handleReservar" :disabled="anuncio.IdEstadoAnuncio !== 1">
                                    <i class="bi bi-bag-check me-2"></i>
                                    {{ getReserveButtonText() }}
                                </button>
                                <button
                                    class="btn btn-outline-danger btn-lg d-flex align-items-center justify-content-center"
                                    @click="handleReport">
                                    <i class="bi bi-exclamation-triangle me-2"></i>
                                    Denunciar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Similar Items Sidebar -->
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <h2 class="h5 mb-3">Outros Anúncios Similares</h2>
                            <div class="d-flex flex-column gap-3">
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
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Denúncia -->
    <div class="modal fade" id="reportModal" tabindex="-1" ref="reportModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Denunciar Anúncio</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Utilizador Denunciado</label>
                        <input type="text" class="form-control"
                            :value="anuncio?.utilizador?.Nome || `Anunciante #${anuncio?.IdUtilizadorAnuncio}`"
                            disabled>
                    </div>
                    <div class="mb-3">
                        <label for="reportReason" class="form-label">Motivo da Denúncia</label>
                        <textarea class="form-control" id="reportReason" v-model="reportReason" rows="3"
                            placeholder="Descreva o motivo da denúncia"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger" @click="submitReport"
                        :disabled="!reportReason">Confirmar Denúncia</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { anunciosService } from '@/api/anuncio';
import { denunciasService } from '@/api/denuncia';
import { Modal } from 'bootstrap';

export default {
    name: 'AnunciosPageView',
    data() {
        return {
            anuncio: null,
            similarAnuncios: [],
            loading: true,
            error: null,
            reportReason: '',
            reportModal: null
        }
    },
    watch: {
        // Add this watch section
        '$route.params.id': {
            handler(newId) {
                if (newId) {
                    this.loading = true;
                    this.fetchAnuncio();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            },
            immediate: true
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
                    value: this.formatTime(this.anuncio.HorarioRecolha)
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
        formatTime(timeString) {
            if (!timeString) return 'Horário não definido';
            return timeString.substring(0, 5);
        },
        getReserveButtonText() {
            if (!this.anuncio) return 'Carregando...';
            if (this.anuncio.IdEstadoAnuncio === 2) return 'Já Reservado';
            if (this.anuncio.IdEstadoAnuncio === 3) return 'Expirado';
            return 'Reservar Produto';
        },
        handleReport() {
            this.reportReason = '';
            this.reportModal.show();
        },
        async submitReport() {
            try {
                await denunciasService.createDenuncia({
                    IdUtilizadorDenunciado: this.anuncio.IdUtilizadorAnuncio,
                    Motivo: this.reportReason,
                    IdAnuncio: this.anuncio.IdAnuncio
                });

                alert('Denúncia enviada com sucesso!');
                this.reportModal.hide();
                this.reportReason = ''; // Limpa o campo após enviar
            } catch (error) {
                console.error('Erro ao denunciar:', error);
                alert('Erro ao enviar denúncia. Por favor, tente novamente.');
            }
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
                    exclude: this.anuncio.IdAnuncio // Pass the current ad ID to exclude
                });
                this.similarAnuncios = response.data;
            } catch (error) {
                console.error('Error fetching similar items:', error);
            }
        },
        async handleReservar() {
            alert('Função de reserva a ser implementada!');
        },
    },
    created() {
        this.fetchAnuncio();
    },
    mounted() {
        // Inicializa o modal do Bootstrap
        this.reportModal = new Modal(this.$refs.reportModal);
    }
}
</script>

<style scoped>
.product-image {
    height: 400px;
}

.similar-image {
    height: 120px;
}

.hover-lift {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.hover-lift:hover {
    transform: translateY(-3px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.btn-primary {
    transition: all 0.2s ease-in-out;
}

.btn-primary:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 0.5rem 1rem rgba(51, 165, 140, 0.15);
}

.profile-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-header {
    border-bottom: 1px solid #dee2e6;
    background-color: #f8f9fa;
}

.modal-footer {
    border-top: 1px solid #dee2e6;
    background-color: #f8f9fa;
}

.form-control:disabled {
    background-color: #e9ecef;
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