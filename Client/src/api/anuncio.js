const API_URL = "http://localhost:3000"; // Ajuste para a URL do seu backend

export const anunciosService = {
  async getAllAnuncios(page = 1, limit = 12, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...filters,
      });

      const response = await fetch(`${API_URL}/anuncios?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching anuncios:", error);
      throw new Error(`Erro ao buscar anúncios: ${error.message}`);
    }
  },

  async getAnuncioById(id) {
    const response = await fetch(`${API_URL}/anuncios/${id}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar anúncio");
    }
    return response.json();
  },

  async getUserAnuncios(userId, page = 1, limit = 10) {
    const queryParams = new URLSearchParams({
      page,
      limit,
    });

    const response = await fetch(
      `${API_URL}/anuncios/utilizador/${userId}?${queryParams}`
    );
    if (!response.ok) {
      throw new Error("Erro ao buscar anúncios do utilizador");
    }
    return response.json();
  },

  async createAnuncio(anuncioData) {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado");
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.IdUtilizador;

      // Usar FormData para enviar imagem
      const formData = new FormData();
      formData.append("IdUtilizadorAnuncio", userId);
      formData.append("Nome", anuncioData.Nome);
      formData.append("Descricao", anuncioData.Descricao);
      formData.append("LocalRecolha", anuncioData.LocalRecolha);
      formData.append("HorarioRecolha", anuncioData.HorarioRecolha);
      formData.append("Preco", anuncioData.Preco);
      formData.append("DataRecolha", anuncioData.DataRecolha);
      formData.append("DataValidade", anuncioData.DataValidade);
      formData.append("Quantidade", anuncioData.Quantidade);
      formData.append("IdProdutoCategoria", anuncioData.IdProdutoCategoria);
      formData.append("IdEstadoAnuncio", 1);

      // Só adiciona imagem se existir
      if (anuncioData.ImagemAnuncio) {
        formData.append("ImagemAnuncio", anuncioData.ImagemAnuncio);
      }

      const response = await fetch(`${API_URL}/anuncios`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // NÃO definir 'Content-Type', o browser define automaticamente para FormData!
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar anúncio");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Erro ao criar anúncio: ${error.message}`);
    }
  },

  async deleteAnuncio(id) {
    const token = sessionStorage.getItem("token");
    const response = await fetch(`${API_URL}/anuncios/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok && response.status !== 204) {
      throw new Error("Erro ao eliminar anúncio");
    }
    return true;
  },

  async reservarAnuncio(idAnuncio) {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado");
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.IdUtilizador;

      // Gerar código de verificação
      const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      let codigoVerificacao = "";
      for (let i = 0; i < 6; i++) {
        codigoVerificacao += chars[Math.floor(Math.random() * chars.length)];
      }

      const response = await fetch(`${API_URL}/anuncios/${idAnuncio}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          IdEstadoAnuncio: 2,
          IdUtilizadorReserva: userId,
          DataReserva: new Date().toISOString(),
          CodigoVerificacao: codigoVerificacao,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao reservar anúncio");
      }

      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async updateAnuncio(id, anuncioData) {
    try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error("Token não encontrado");
        }

        // Format dates properly
        const formattedData = {
            ...anuncioData,
            DataRecolha: anuncioData.DataRecolha ? anuncioData.DataRecolha.substring(0, 10) : null,
            DataValidade: anuncioData.DataValidade ? anuncioData.DataValidade.substring(0, 10) : null,
            DataReserva: anuncioData.DataReserva ? anuncioData.DataReserva.substring(0, 10) : null,
            // Ensure numeric fields are numbers
            Preco: Number(anuncioData.Preco),
            Quantidade: Number(anuncioData.Quantidade),
            IdProdutoCategoria: Number(anuncioData.IdProdutoCategoria),
            IdEstadoAnuncio: Number(anuncioData.IdEstadoAnuncio),
            IdUtilizadorAnuncio: Number(anuncioData.IdUtilizadorAnuncio)
        };

        const response = await fetch(`${API_URL}/anuncios/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formattedData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erro ao atualizar anúncio");
        }

        return response.json();
    } catch (error) {
        console.error("Erro em updateAnuncio:", error);
        throw new Error(`Erro ao atualizar anúncio: ${error.message}`);
    }
},

  getUserAnuncios: async (userId, page = 1, limit = 6) => {
    const queryParams = new URLSearchParams({
      page,
      limit,
    });

    const response = await fetch(
      `${API_URL}/anuncios/utilizador/${userId}?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao buscar anúncios do utilizador");
    }
    return response.json();
  },

  getReservasByUser: async (userId, page = 1, limit = 6) => {
    const queryParams = new URLSearchParams({
      page,
      limit,
    });

    const response = await fetch(
      `${API_URL}/anuncios/reservas/${userId}?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao buscar reservas do utilizador");
    }
    return response.json();
  },
  confirmarCodigoEntrega: async (idAnuncio, codigo) => {
    const token = sessionStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/anuncios/${idAnuncio}/confirmarCodigo`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codigo }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao confirmar código de entrega");
    }
    return response.json();
  },
};
