<template>
    <div class="card border-0 shadow-lg h-100 overflow-hidden">
        <div class="position-relative">
            <img :src="anuncio.ImagemAnuncio || 'https://via.placeholder.com/500'" :alt="anuncio.Nome"
                class="card-img-top product-image object-fit-cover">
            <div class="image-overlay"></div>
            <span class="position-absolute top-0 end-0 m-4 badge bg-primary px-4 py-2 rounded-pill fs-5 shadow-sm">
                {{ formatPrice(anuncio.Preco) }}
            </span>
        </div>

        <div class="card-body p-4">
            <!-- Title and User Info -->
            <div class="mb-4">
                <h2 class="h3 mb-4 text-primary fw-bold">{{ anuncio.Nome }}</h2>
                <div class="d-flex align-items-center gap-3 bg-light p-4 rounded-4">
                    <div class="position-relative">
                        <img :src="anuncio.utilizador?.ImagemPerfil || 'https://via.placeholder.com/50'" alt="Profile"
                            class="rounded-circle profile-image">
                        <div class="profile-border"></div>
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center flex-wrap gap-2">
                            <h3 class="h6 mb-0 fw-semibold">
                                {{ anuncio.utilizador?.Nome || `Anunciante #${anuncio.IdUtilizadorAnuncio}` }}
                            </h3>
                            <div class="d-flex align-items-center">
                                <div class="stars">
                                    <template v-for="i in 5" :key="i">
                                        <i :class="[
                                            'bi',
                                            i <= Math.round(anuncio.utilizador?.Classificacao || 0)
                                                ? 'bi-star-fill text-warning'
                                                : 'bi-star text-muted'
                                        ]"></i>
                                    </template>
                                </div>
                                <small class="text-muted ms-1 fw-medium">
                                    ({{ anuncio.utilizador?.Classificacao?.toFixed(1) || '0.0' }})
                                </small>
                            </div>
                        </div>
                        <p class="mb-0 text-muted small mt-1">
                            <i class="bi bi-geo-alt-fill me-1"></i>
                            {{ anuncio.LocalRecolha }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Details Grid -->
            <div class="row g-4 mb-4">
                <div class="col-md-6" v-for="(detail, index) in details" :key="index">
                    <div class="p-4 bg-light rounded-4 h-100 detail-card">
                        <div class="d-flex align-items-center">
                            <div class="icon-wrapper me-3">
                                <i :class="detail.icon + ' text-primary'"></i>
                            </div>
                            <div>
                                <div class="text-muted small">{{ detail.label }}</div>
                                <div class="fw-medium">{{ detail.value }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div class="mb-4">
                <h5 class="mb-3 fw-bold text-primary">
                    <i class="bi bi-file-text me-2"></i>Descrição
                </h5>
                <div class="bg-light p-4 rounded-4">
                    {{ anuncio.Descricao || 'Sem descrição disponível.' }}
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-3">
                <button class="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center action-btn"
                    @click="$emit('reserve')" :disabled="anuncio.IdEstadoAnuncio !== 1">
                    <i class="bi bi-bag-check me-2"></i>
                    {{ getReserveButtonText() }}
                </button>
                <button class="btn btn-outline-danger d-flex align-items-center justify-content-center action-btn"
                    @click="$emit('report')">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Denunciar
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AnuncioDetail',
    props: {
        anuncio: {
            type: Object,
            required: true
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
        }
    }
}
</script>

<style scoped>
.product-image {
    height: 500px;
    transition: transform 0.3s ease;
}

.image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1));
}

.profile-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-border {
    position: absolute;
    inset: -2px;
    border: 2px solid rgba(var(--bs-primary-rgb), 0.2);
    border-radius: 50%;
}

.icon-wrapper {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(var(--bs-primary-rgb), 0.1);
    border-radius: 12px;
}

.detail-card {
    border: 1px solid rgba(0,0,0,0.05);
    background-color: var(--bs-light);
}

.stars i {
    font-size: 0.875rem;
    margin-right: 2px;
}

.stars i.text-warning {
    color: #ffc107 !important;
}

.rounded-4 {
    border-radius: 1rem;
}

.action-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.95rem;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.btn-primary {
    background-color: var(--bs-primary);
    border: none;
}

.btn-primary:hover:not(:disabled) {
    background-color: var(--bs-primary);
    filter: brightness(1.1);
}

.btn-outline-danger {
    border: 1.5px solid var(--bs-danger);
    color: var(--bs-danger);
    background: transparent;
}

.btn-outline-danger:hover {
    background-color: var(--bs-danger);
    color: white;
}

@media (max-width: 992px) {
    .product-image {
        height: 400px;
    }
}

@media (max-width: 576px) {
    .product-image {
        height: 300px;
    }

    .action-btn {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
}
</style>