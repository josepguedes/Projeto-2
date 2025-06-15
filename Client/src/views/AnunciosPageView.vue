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
            <div v-else>
                <div class="row g-4">
                    <!-- Main Content -->
                    <div class="col-lg-8">
                        <AnuncioDetail :anuncio="anuncio" @reserve="handleReservar" @report="handleReport" />
                    </div>

                    <!-- Similar Items Sidebar -->
                    <div class="col-lg-4">
                        <SimilarAds :currentAnuncioId="anuncio?.IdAnuncio" />
                    </div>
                </div>

                <!-- Avaliations Section -->
                <div class="row mt-5">
                    <div class="col-12">
                        <h2 class="h4 mb-4">Avaliações do Vendedor</h2>
                        <AvaliationsSection :userId="anuncio?.IdUtilizadorAnuncio" />
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
                        :disabled="!reportReason">Confirmar
                        Denúncia</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { anunciosService } from '@/api/anuncio';
import { denunciasService } from '@/api/denuncia';
import { notificacoesService } from '@/api/notificacoes';
import { Modal } from 'bootstrap';
import AnuncioDetail from '@/components/AnuncioDetail.vue';
import SimilarAds from '@/components/SimilarAds.vue';
import AvaliationsSection from '@/components/AvaliationsSection.vue';

export default {
    name: 'AnunciosPageView',
    components: {
        AnuncioDetail,
        SimilarAds,
        AvaliationsSection
    },
    data() {
        return {
            anuncio: null,
            loading: true,
            error: null,
            reportReason: '',
            reportModal: null
        }
    },
    watch: {
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
        },
        userRating() {
            return this.anuncio?.utilizador?.Classificacao || 0;
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
                this.reportReason = '';
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
            } catch (error) {
                this.error = 'Erro ao carregar o anúncio. Por favor, tente novamente.';
                console.error('Error:', error);
            } finally {
                this.loading = false;
            }
        },
        async handleReservar() {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    alert('Por favor, faça login para reservar o produto');
                    this.$router.push('/login');
                    return;
                }

                // Verifica se o anúncio já está reservado
                if (this.anuncio.IdEstadoAnuncio === 2) {
                    alert('Este produto já está reservado.');
                    return;
                }

                // Verifica se o anúncio está expirado
                if (this.anuncio.IdEstadoAnuncio === 3) {
                    alert('Este produto está expirado.');
                    return;
                }

                const confirmacao = confirm('Tem certeza que deseja reservar este produto?');
                if (!confirmacao) return;

                const response = await anunciosService.reservarAnuncio(this.anuncio.IdAnuncio);

                if (response.data) {
                    alert(`Produto reservado com sucesso!\nSeu código de verificação é: ${response.data.CodigoVerificacao}`);
                    await this.fetchAnuncio();

                    // Associar notificação de reserva confirmada (ID 2)
                    const token = sessionStorage.getItem('token');
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    await notificacoesService.associarNotificacaoAUtilizador({
                        IdNotificacao: 2,
                        IdUtilizador: payload.IdUtilizador
                    });
                }
            } catch (error) {
                console.error('Erro ao reservar:', error);
                alert(error.message || 'Erro ao reservar o produto. Por favor, tente novamente.');
            }
        }
    },
    created() {
        this.fetchAnuncio();
    },
    mounted() {
        this.reportModal = new Modal(this.$refs.reportModal);
    }
}
</script>

<style scoped>
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
</style>