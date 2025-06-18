<template>
    <div class="modal" :class="{ 'd-block': show }" tabindex="1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalhes do Anúncio</h5>
                    <button type="button" class="btn-close" @click="$emit('close')"></button>
                </div>

                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-5">
                            <div class="product-image-container">
                                <img :src="anuncio.ImagemAnuncio || 'https://via.placeholder.com/500'"
                                    :alt="anuncio.Nome" class="img-fluid rounded">
                                <span :class="['status-badge', getStatusClass(anuncio.IdEstadoAnuncio)]">
                                    {{ getStatusText(anuncio.IdEstadoAnuncio) }}
                                </span>
                            </div>
                        </div>
                        <div class="col-md-7">
                            <div class="product-info">
                                <h4 class="product-title mb-3">{{ anuncio.Nome }}</h4>

                                <div class="price-section mb-4">
                                    <h5 class="price">{{ formatPrice(anuncio.Preco) }}</h5>
                                    <span class="quantity">Quantidade disponível: {{ anuncio.Quantidade }}</span>
                                </div>

                                <div class="info-grid">
                                    <div class="info-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <div>
                                            <label>Local de Recolha</label>
                                            <span>{{ anuncio.LocalRecolha }}</span>
                                        </div>
                                    </div>

                                    <div class="info-item">
                                        <i class="fas fa-clock"></i>
                                        <div>
                                            <label>Horário de Recolha</label>
                                            <span>{{ anuncio.HorarioRecolha }}</span>
                                        </div>
                                    </div>

                                    <div class="info-item">
                                        <i class="fas fa-calendar-plus"></i>
                                        <div>
                                            <label>Data de Publicação</label>
                                            <span>{{ formatDate(anuncio.DataAnuncio) }}</span>
                                        </div>
                                    </div>

                                    <div class="info-item">
                                        <i class="fas fa-calendar-times"></i>
                                        <div>
                                            <label>Data de Validade</label>
                                            <span>{{ formatDate(anuncio.DataValidade) }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="description-section mt-4">
                                    <h6>Descrição</h6>
                                    <p>{{ anuncio.Descricao || 'Sem descrição.' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UserAnuncioDetails',
    props: {
        anuncio: {
            type: Object,
            required: true
        },
        show: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        formatPrice(price) {
            if (Number(price) === 0) return 'Grátis';
            return Number(price).toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR'
            });
        },
        formatDate(date) {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('pt-PT');
        },
        getStatusClass(status) {
            const classes = {
                1: 'badge bg-success',
                2: 'badge bg-warning text-dark',
                3: 'badge bg-secondary',
                4: 'badge bg-danger',
                5: 'badge bg-info'
            };
            return classes[status] || 'badge bg-secondary';
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
        },
        handleEdit() {
            alert('Função de edição a ser implementada');
        }
    }
}
</script>

<style scoped>
.modal {
    background-color: rgba(0, 0, 0, 0.5);
}

.product-image-container {
    position: relative;
    margin-bottom: 1rem;
}

.product-image-container img {
    max-height: 300px;
    object-fit: cover;
    width: 100%;
}

.status-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 0.5em 0.8em;
    border-radius: 4px;
    font-weight: 500;
}

.product-title {
    color: #2c3e50;
    font-weight: 600;
}

.price-section {
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;
}

.price {
    color: #2c3e50;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.quantity {
    color: #666;
    font-size: 0.9rem;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-top: 1.5rem;
}

.info-item {
    display: flex;
    align-items: start;
    gap: 0.8rem;
}

.info-item i {
    color: #3498db;
    font-size: 1.2rem;
    margin-top: 3px;
}

.info-item div {
    display: flex;
    flex-direction: column;
}

.info-item label {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.2rem;
}

.info-item span {
    color: #2c3e50;
    font-weight: 500;
}

.description-section {
    border-top: 1px solid #eee;
    padding-top: 1rem;
}

.description-section h6 {
    color: #666;
    margin-bottom: 0.8rem;
}

.description-section p {
    color: #2c3e50;
    line-height: 1.6;
}

.info-item i {
    color: #27ae60 !important;
}
</style>