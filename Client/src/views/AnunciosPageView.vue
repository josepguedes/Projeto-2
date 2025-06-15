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

    <PaymentModal v-if="showPayment" :show="showPayment" :item="anuncio" @close="showPayment = false"
        @payment-success="handlePaymentSuccess" />

    <!-- Modal de Denúncia -->
    <DenunciaModal v-if="anuncio" ref="denunciaModal" :idDenunciado="anuncio.IdUtilizadorAnuncio"
        :utilizadorDenunciado="anuncio.utilizador?.Nome || `Anunciante #${anuncio.IdUtilizadorAnuncio}`"
        tipo="Anúncio" />

</template>

<script>
import { anunciosService } from '@/api/anuncio';
import { denunciasService } from '@/api/denuncia';
import { notificacoesService } from '@/api/notificacoes';
import { Modal } from 'bootstrap';
import AnuncioDetail from '@/components/AnuncioDetail.vue';
import SimilarAds from '@/components/SimilarAds.vue';
import AvaliationsSection from '@/components/AvaliationsSection.vue';
import DenunciaModal from '@/components/DenunciaModal.vue';
import PaymentModal from '@/components/PaymentModal.vue';

export default {
    name: 'AnunciosPageView',
    components: {
        AnuncioDetail,
        SimilarAds,
        AvaliationsSection,
        DenunciaModal,
        PaymentModal
    },
    data() {
        return {
            anuncio: null,
            loading: true,
            error: null,
            reportReason: '',
            reportModal: null,
            showPayment: false
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
        handleReport() {
            const token = sessionStorage.getItem('token');
            if (!token) {
                alert('Por favor, faça login para denunciar');
                this.$router.push('/login');
                return;
            }
            this.$refs.denunciaModal.showModal();
        },
        async submitReport() {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    alert('Por favor, faça login para denunciar');
                    this.$router.push('/login');
                    return;
                }

                // Obter o ID do utilizador denunciante do token
                const payload = JSON.parse(atob(token.split('.')[1]));

                await denunciasService.createDenuncia({
                    IdUtilizadorDenunciante: payload.IdUtilizador, // Adicionar ID do denunciante
                    IdUtilizadorDenunciado: this.anuncio.IdUtilizadorAnuncio,
                    Motivo: this.reportReason,
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

                if (this.anuncio.IdEstadoAnuncio === 2) {
                    alert('Este produto já está reservado.');
                    return;
                }

                if (this.anuncio.IdEstadoAnuncio === 3) {
                    alert('Este produto está expirado.');
                    return;
                }

                // Mostrar modal de pagamento
                this.showPayment = true;
            } catch (error) {
                console.error('Erro ao reservar:', error);
                alert(error.message || 'Erro ao reservar o produto.');
            }
        },

        async handlePaymentSuccess() {
            await this.fetchAnuncio();
            this.showPayment = false;
        },
    },
    created() {
        this.fetchAnuncio();
    },
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