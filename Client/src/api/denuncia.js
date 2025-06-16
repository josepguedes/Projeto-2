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
    const token = sessionStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/denuncias?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar denúncias");
    }

    const data = await response.json();

      if (!response.ok) {
        throw new Error("Erro ao buscar denúncias");
      }

        if (denuncia.IdAnuncio) {
          promises.push(
            fetch(`${API_URL}/anuncios/${denuncia.IdAnuncio}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
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
            fetch(`${API_URL}/utilizadores/${denuncia.IdUtilizadorDenunciado}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
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
    });
    if (!response.ok) {
      throw new Error("Erro ao eliminar denúncia");
    }
    return response;
  },
};
