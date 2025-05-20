const API_URL = 'http://localhost:3000';

export const notificacoesService = {
    async getAllNotificacoes(page = 1, limit = 10) {
        const token = sessionStorage.getItem('token');
        const queryParams = new URLSearchParams({
            page,
            limit
        }).toString();

        const response = await fetch(`${API_URL}/notificacoes?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao buscar notificações');
        }

        return response.json();
    }
};