const API_URL = "http://localhost:3000"; // Ajuste para a URL do seu backend

export const anunciosService = {
  async getAllAnuncios(page = 1, limit = 10, filters = {}) {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters,
    });

    const response = await fetch(`${API_URL}/anuncios?${queryParams}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar anúncios");
    }
    return response.json();
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

  async reserveAnuncio(anuncioId) {
    const token = sessionStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.IdUtilizador;

    // Get current date and add 1 hour
    const now = new Date();
    const portugalTime = new Date(now.getTime() + 1 * 60 * 60 * 1000);

    const response = await fetch(`${API_URL}/anuncios/${anuncioId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        IdUtilizadorReserva: userId,
        DataReserva: portugalTime.toISOString(),
        IdEstadoAnuncio: 2,
        CodigoVerificacao: Math.floor(10000 + Math.random() * 90000).toString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao reservar anúncio");
    }

    const data = await response.json();
    return data;
  },
};