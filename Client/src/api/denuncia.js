const API_URL = "http://localhost:3000";

export const denunciasService = {
  async createDenuncia(denuncia) {
    try {
      const response = await fetch(`${API_URL}/denuncias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          IdUtilizadorDenunciante: denuncia.IdUtilizadorDenunciante,
          IdUtilizadorDenunciado: denuncia.IdUtilizadorDenunciado,
          IdAnuncio: denuncia.IdAnuncio,
          Motivo: denuncia.Motivo,
          DataDenuncia: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao enviar denúncia");
      }

      return response.json();
    } catch (error) {
      console.error("Error in createDenuncia:", error);
      throw error;
    }
  },

  async getAllDenuncias(page = 1, limit = 10) {
    const response = await fetch(
      `${API_URL}/denuncias?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar denúncias");
    }

    const data = await response.json();

    // Buscar detalhes dos anúncios e utilizadores para cada denúncia
    const denunciasComDetalhes = await Promise.all(
      data.data.map(async (denuncia) => {
        // Only fetch if IdAnuncio and IdUtilizadorDenunciado are not null
        const promises = [];
        let anuncio = null;
        let utilizador = null;

        if (denuncia.IdAnuncio) {
          promises.push(
            fetch(`${API_URL}/anuncios/${denuncia.IdAnuncio}`)
              .then((res) => res.json())
              .then((data) => (anuncio = data.data))
              .catch((err) =>
                console.error(
                  `Erro ao buscar anúncio ${denuncia.IdAnuncio}:`,
                  err
                )
              )
          );
        }

        if (denuncia.IdUtilizadorDenunciado) {
          promises.push(
            fetch(`${API_URL}/utilizadores/${denuncia.IdUtilizadorDenunciado}`)
              .then((res) => res.json())
              .then((data) => (utilizador = data))
              .catch((err) =>
                console.error(
                  `Erro ao buscar utilizador ${denuncia.IdUtilizadorDenunciado}:`,
                  err
                )
              )
          );
        }

        await Promise.all(promises);

        return {
          ...denuncia,
          anuncio: anuncio,
          utilizadorDenunciado: utilizador,
        };
      })
    );

    return {
      ...data,
      data: denunciasComDetalhes,
    };
  },

  async deleteDenuncia(id) {
    const response = await fetch(`${API_URL}/denuncias/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Erro ao eliminar denúncia");
    }
    return response;
  },
};
