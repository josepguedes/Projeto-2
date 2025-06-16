const API_URL = "http://localhost:3000";

export const adminBloqueiosService = {
    async checkAdminBlock(userId) {
        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch(`http://localhost:3000/bloqueios/admin/check/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Erro ao verificar bloqueio');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },

    async createBloqueio(idUtilizador, dataFimBloqueio = null) {
        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error("Token não encontrado");
        }

        const response = await fetch(`${API_URL}/bloqueios/admin`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                IdBloqueado: idUtilizador, // Corrigido para IdBloqueado
                DataFimBloqueio: dataFimBloqueio
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Erro ao bloquear utilizador");
        }

        return response.json();
    },

    async deleteBloqueio(idBloqueio) {
        const token = sessionStorage.getItem("token");
        if (!token) {
            throw new Error("Token não encontrado");
        }

        const response = await fetch(`${API_URL}/bloqueios/admin/${idBloqueio}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Erro ao desbloquear utilizador");
        }

        return response.json();
    }
};