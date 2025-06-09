const API_URL = 'http://localhost:3000';

export const paymentService = {
    async createPayPalOrder(amount) {
        try {
            return window.paypal.Buttons({
                style: {
                    shape: "rect",
                    color: "blue",
                    layout: "vertical",
                    label: "paypal"
                },
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: amount
                            }
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    await actions.order.capture();
                    return true;
                }
            });
        } catch (error) {
            console.error('PayPal error:', error);
            throw new Error('Erro ao inicializar PayPal');
        }
    },

    async updateAnuncioAfterPayment(anuncioId) {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/anuncios/${anuncioId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                IdEstadoAnuncio: 2
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar o estado da reserva');
        }

        return response.json();
    }
};