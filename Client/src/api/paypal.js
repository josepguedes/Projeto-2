const API_URL = "http://localhost:3000";

const PAYPAL_CONFIG = {
  client_id:
    "AUwW60K8YG6rKUctsc0zn2kc-K9ZtJiK1-H32C-GsUaw24EkmTlgLTZpvF2TOzs-L93WoweWf2H7wjuS",
  currency: "EUR",
};

export const paymentService = {
  async createPayPalOrder(amount, onSuccessCallback) {
    try {
      return window.paypal.Buttons({
        style: {
          shape: "rect",
          color: "blue",
          layout: "vertical",
          label: "paypal",
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: PAYPAL_CONFIG.currency,
                  value: Number(amount).toFixed(2),
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          try {
            const order = await actions.order.capture();
            if (order.status === "COMPLETED" && onSuccessCallback) {
              await onSuccessCallback(order);
            }
            return order;
          } catch (error) {
            console.error("PayPal payment error:", error);
            throw error;
          }
        },
      });
    } catch (error) {
      console.error("PayPal error:", error);
      throw new Error("Erro ao inicializar PayPal");
    }
  },

  async updateAnuncioAfterPayment(anuncioId, estadoAnuncio = 2) {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${API_URL}/anuncios/${anuncioId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        IdEstadoAnuncio: estadoAnuncio,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar o estado da reserva");
    }

    return response.json();
  },
};