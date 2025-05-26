const API_URL = 'http://localhost:3000';

export const notificacoesService = {
    async getAllNotificacoes(page = 1, limit = 10) {
        try {
            const response = await fetch(`${API_URL}/notificacoes?page=${page}&limit=${limit}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao buscar notificações');
            }

            const data = await response.json();
            
            return {
                ...data,
                data: data.data.map(notificacao => {
                    // Ensure DataNotificacao is a valid date string
                    const dataNotificacao = new Date(notificacao.DataNotificacao);
                    
                    return {
                        ...notificacao,
                        DataNotificacao: dataNotificacao.toISOString().split('T')[0], // Format as YYYY-MM-DD
                        HoraNotificacao: notificacao.HoraNotificacao 
                            ? notificacao.HoraNotificacao.substring(0, 5) 
                            : dataNotificacao.toTimeString().substring(0, 5)
                    };
                })
            };
        } catch (err) {
            console.error('Error in getAllNotificacoes:', err);
            throw new Error('Erro ao buscar notificações');
        }
    },

    async deleteNotificacao(id) {
        try {
            const response = await fetch(`${API_URL}/notificacoes/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao eliminar notificação');
            }

            return true;
        } catch (err) {
            console.error('Error in deleteNotificacao:', err);
            throw new Error('Erro ao eliminar notificação');
        }
    }
};