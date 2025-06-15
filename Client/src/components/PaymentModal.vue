<template>
    <div v-if="show" class="payment-modal">
        <div class="payment-overlay" @click="$emit('close')"></div>
        <div class="payment-content">
            <div class="payment-header">
                <h3>Pagamento</h3>
                <button class="btn-close" @click="$emit('close')"></button>
            </div>
            <div class="payment-body">
                <div class="product-details mb-3">
                    <h4 class="paypal-title">{{ item.Nome }}</h4>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Local:</span>
                        <span>{{ item.LocalRecolha }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Data:</span>
                        <span>{{ formatDate(item.DataRecolha) }}</span>
                    </div>
                    <div class="paypal-text">
                        <span>Total a Pagar</span>
                        <span>{{ formatPrice(item.Preco) }}</span>
                    </div>
                </div>
                <hr>
                <div id="paypal-button-container"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { paymentService } from '@/api/paypal';
import { notificacoesService } from '@/api/notificacoes';

export default {
    name: 'PaymentModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        item: {
            type: Object,
            required: true
        }
    },
    watch: {
        show: {
            immediate: true, // Isso faz com que o watcher seja executado assim que o componente é montado
            handler(newVal) {
                if (newVal) {
                    this.$nextTick(() => {
                        this.mountPayPalButton();
                    });
                }
            }
        }
    },
    methods: {
        formatDate(date) {
            if (!date) return 'Data não definida';
            return new Date(date).toLocaleDateString('pt-PT');
        },

        formatPrice(price) {
            if (!price) return '0,00€';
            return Number(price).toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR'
            });
        },
        async mountPayPalButton() {
            try {
                const container = document.getElementById('paypal-button-container');
                if (container) container.innerHTML = '';

                const paypalButtons = await paymentService.createPayPalOrder(
                    this.item.Preco,
                    async (order) => {
                        try {
                            await paymentService.updateAnuncioAfterPayment(this.item.IdAnuncio);

                            // Notificar sucesso
                            this.$emit('payment-success');
                            this.$emit('close');

                            // Associar notificação
                            const token = sessionStorage.getItem('token');
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            await notificacoesService.associarNotificacaoAUtilizador({
                                IdNotificacao: 2,
                                IdUtilizador: payload.IdUtilizador
                            });

                            alert('Pagamento processado com sucesso!');
                            window.location.reload();
                        } catch (error) {
                            console.error('Erro após pagamento:', error);
                            alert('Erro ao processar pagamento.');
                        }
                    }
                );

                paypalButtons.render("#paypal-button-container");
            } catch (error) {
                console.error('Erro ao inicializar PayPal:', error);
                alert('Erro ao inicializar o pagamento. Por favor, tente novamente.');
            }
        }
    }
}
</script>

<style scoped>
.payment-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
}

.payment-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1051;
}

.payment-content {
    background: white;
    border-radius: 1rem;
    width: 90%;
    max-width: 500px;
    position: relative;
    z-index: 1052;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.payment-header {
    padding: 1rem;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.payment-body {
    padding: 1.5rem;
}

.product-details {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 0.5rem;
}

#paypal-button-container {
    margin-top: 1rem;
    min-height: 150px;
}

.paypal-title {
    font-weight: 600;
    font-size: 1.2rem;
    color: #2d3436;
    margin-bottom: 1rem;
}

.paypal-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.1rem;
    color: #2d3436;
    margin-top: 1rem;
    font-weight: 600;
}
</style>