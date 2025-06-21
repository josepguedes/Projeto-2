const API_URL = 'http://localhost:3000';

export const notificacoesService = {
    async getAllNotificacoes(page = 1, limit = 10) {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/notificacoes?page=${page}&limit=${limit}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/notificacoes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao eliminar notificação');
            }

            return true;
        } catch (err) {
            console.error('Error in deleteNotificacao:', err);
            throw new Error('Erro ao eliminar notificação');
        }
    },

    async getNotificacoesByUserId(idUtilizador) {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/notificacoes/user/by-recipient-id?idUtilizador=${idUtilizador}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao buscar notificações do usuário (por recipiente)');
        }
        const data = await response.json();
        return data;
    },

    async associarNotificacaoAUtilizador({ IdNotificacao, IdUtilizador }) {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/notificacoes/associar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ IdNotificacao, IdUtilizador }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro ao associar notificação' }));
            throw new Error(errorData.message || 'Erro ao associar notificação');
        }
        return response.json();
    },

    async fetchMinhasNotificacoes() {
        if (!this.currentUserId) {
            this.error = "ID do utilizador não encontrado para buscar notificações.";
            this.notificacoes = [];
            return;
        }
        this.loading = true;
        this.error = null;
        try {
            const response = await notificacoesService.getNotificacoesByUserId(this.currentUserId);
            // Limita às 4 mais recentes
            this.notificacoes = response.data
                .slice(0, 4)
                .map(n => ({
                    IdAssociacao: n.IdAssociacao,
                    Mensagem: n.Mensagem,
                    DataRececaoPeloUtilizador: n.DataRececaoPeloUtilizador,
                    NotificacaoLida: n.NotificacaoLida,
                }));
            // Marcar todas como lidas ao abrir
            await notificacoesService.marcarTodasComoLidas();
            window.dispatchEvent(new CustomEvent('notifications-updated'));
        } catch (err) {
            this.error = err.message || 'Erro ao carregar notificações';
            this.notificacoes = [];
        } finally {
            this.loading = false;
        }
    },

    async marcarTodasComoLidas() {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/notificacoes/marcar-todas-lidas`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Erro ao marcar notificações como lidas');
        }
        return response.json();
    }
};