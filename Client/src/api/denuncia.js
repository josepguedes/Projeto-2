const API_URL = "http://localhost:3000";

export const denunciasService = {
  async createDenuncia(denuncia) {
    try {
      const response = await fetch(`${API_URL}/denuncias`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          IdUtilizadorDenunciante: denuncia.IdUtilizadorDenunciante,
          IdUtilizadorDenunciado: denuncia.IdUtilizadorDenunciado,
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
    try {
      const response = await fetch(
        `${API_URL}/denuncias?page=${page}&limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar denúncias");
      }

      const data = await response.json();

      // Buscar detalhes apenas dos utilizadores para cada denúncia
      const denunciasComDetalhes = await Promise.all(
        data.data.map(async (denuncia) => {
          let utilizador = null;

          if (denuncia.IdUtilizadorDenunciado) {
            try {
              const userResponse = await fetch(
                `${API_URL}/utilizadores/${denuncia.IdUtilizadorDenunciado}`,
                {
                  headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                  },
                }
              );
              if (userResponse.ok) {
                utilizador = await userResponse.json();
              }
            } catch (err) {
              console.error(
                `Erro ao buscar utilizador ${denuncia.IdUtilizadorDenunciado}:`,
                err
              );
            }
          }

          return {
            ...denuncia,
            utilizadorDenunciado: utilizador,
          };
        })
      );

      return {
        ...data,
        data: denunciasComDetalhes,
      };
    } catch (error) {
      console.error("Error in getAllDenuncias:", error);
      throw error;
    }
  },

  async deleteDenuncia(id) {
    const response = await fetch(`${API_URL}/denuncias/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Erro ao eliminar denúncia");
    }
    return response;
  },
};