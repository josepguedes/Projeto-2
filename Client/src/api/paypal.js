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
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado");
      }

      // Get anuncio details first
      const anuncioResponse = await fetch(`${API_URL}/anuncios/${anuncioId}`);
      if (!anuncioResponse.ok) {
        throw new Error("Erro ao buscar dados do anúncio");
      }
      const anuncioData = await anuncioResponse.json();
      const anuncio = anuncioData.data;

      // Get user ID from token
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.IdUtilizador;

      // Format dates to YYYY-MM-DD
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      // Generate verification code
      const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      let codigoVerificacao = "";
      for (let i = 0; i < 6; i++) {
        codigoVerificacao += chars[Math.floor(Math.random() * chars.length)];
      }

      // Send update request with formatted dates
      const response = await fetch(`${API_URL}/anuncios/${anuncioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Nome: anuncio.Nome,
          Descricao: anuncio.Descricao,
          LocalRecolha: anuncio.LocalRecolha,
          HorarioRecolha: anuncio.HorarioRecolha,
          DataRecolha: formatDate(anuncio.DataRecolha),
          Preco: anuncio.Preco,
          DataValidade: formatDate(anuncio.DataValidade),
          Quantidade: anuncio.Quantidade,
          IdProdutoCategoria: anuncio.IdProdutoCategoria,
          IdEstadoAnuncio: estadoAnuncio,
          IdUtilizadorReserva: userId,
          DataReserva: formatDate(new Date()),
          CodigoVerificacao: codigoVerificacao,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Erro ao atualizar o estado da reserva"
        );
      }

      return response.json();
    } catch (error) {
      console.error("Erro em updateAnuncioAfterPayment:", error);
      throw error;
    }
  },
};
