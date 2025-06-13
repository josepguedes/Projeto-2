const API_URL = 'http://localhost:3000';

export const adminBloqueiosService = {
    async getAllBloqueios(page = 1, limit = 10) {
        const token = sessionStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }

        const response = await fetch(`${API_URL}/bloqueios/admin?page=${page}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao buscar bloqueios administrativos');
        }

        return response.json();
    },

    async createBloqueio(idUtilizador, motivo) {
        const token = sessionStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }

        const response = await fetch(`${API_URL}/bloqueios/admin`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                IdUtilizadorBloqueado: idUtilizador,
                Motivo: motivo
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao bloquear utilizador');
        }

        return response.json();
    },

    async deleteBloqueio(idBloqueio) {
        const token = sessionStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado');
        }

        const response = await fetch(`${API_URL}/bloqueios/admin/${idBloqueio}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao desbloquear utilizador');
        }

        return response.json();
    }
};