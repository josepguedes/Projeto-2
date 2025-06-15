<template>
    <div class="notifications-box" v-if="isOpen" ref="notificationBoxRef">
        <div class="notifications-header">
            <h4>Notificações</h4>
            <button @click="closeBox" class="close-btn">&times;</button>
        </div>
        <div v-if="loading" class="loading-state">A carregar...</div>
        <div v-if="error" class="error-state">{{ error }}</div>
        <div v-if="!loading && !error && notificacoes.length === 0" class="empty-state">
            Não tem notificações.
        </div>
        <ul v-if="!loading && !error && notificacoes.length > 0" class="notifications-list">
            <li v-for="notificacao in notificacoes" :key="notificacao.IdAssociacao"
                :class="['notification-item', notificacao.Estado === 'lida' ? 'read' : 'unread']">
                <div class="notification-content">
                    <p class="message">{{ notificacao.Mensagem }}</p>
                    <small class="date-time">
                        Recebida em: {{ formatDate(notificacao.DataRececaoPeloUtilizador) }}
                        <span v-if="notificacao.HoraNotificacaoOriginal">às {{
                            formatTime(notificacao.HoraNotificacaoOriginal) }}</span>
                    </small>
                </div>
                <div class="notification-actions">
                    <button v-if="notificacao.Estado === 'não lida'" @click="marcarComoLida(notificacao.IdAssociacao)"
                        class="btn btn-sm btn-outline-primary">
                        Marcar como lida
                    </button>
                    <!-- Poderia adicionar um botão para apagar a associação da notificação aqui se desejado -->
                </div>
            </li>
        </ul>
        <!-- Adicionar paginação se necessário -->
    </div>
</template>

<script>
import { notificacoesService } from '@/api/notificacoes.js';

export default {
    name: 'NotificationsBox',
    props: {
        isOpen: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            notificacoes: [],
            loading: false,
            error: null,
            currentUserId: null,
            // Para paginação (exemplo básico)
            // currentPage: 1,
            // totalPages: 1,
            // itemsPerPage: 10,
        };
    },
    watch: {
        isOpen(newVal) {
            if (newVal) {
                this.getUserIdFromToken();
                if (this.currentUserId) {
                    this.fetchMinhasNotificacoes();
                } else {
                    this.error = "Utilizador não autenticado.";
                    this.notificacoes = [];
                }
            }
        }
    },
    methods: {
        getUserIdFromToken() {
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    this.currentUserId = payload.IdUtilizador;
                } catch (e) {
                    console.error("Erro ao descodificar token:", e);
                    this.currentUserId = null;
                }
            } else {
                this.currentUserId = null;
            }
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
                this.notificacoes = response.data.map(n => ({
                    IdAssociacao: n.IdAssociacao,
                    Mensagem: n.Mensagem,
                    DataRececaoPeloUtilizador: n.DataRececaoPeloUtilizador, 
                    HoraNotificacaoOriginal: n.HoraNotificacaoOriginal
                }));
            } catch (err) {
                this.error = err.message || 'Erro ao carregar notificações';
                this.notificacoes = [];
            } finally {
                this.loading = false;
            }
        },
        async marcarComoLida(idAssociacao) {
            try {
                await notificacoesService.marcarEstadoNotificacao(idAssociacao, 'lida');
                const index = this.notificacoes.findIndex(n => n.IdAssociacao === idAssociacao);
                if (index !== -1) {
                    this.notificacoes[index].Estado = 'lida';
                }
                window.dispatchEvent(new CustomEvent('notifications-updated'));
            } catch (err) {
                console.error('Erro ao marcar notificação como lida:', err);
                alert(err.message || 'Não foi possível marcar a notificação como lida.');
            }
        },
        formatDate(dateString) {
            if (!dateString) return '';
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString('pt-PT', options);
        },
        formatTime(timeString) {
            if (!timeString) return '';
            return timeString.substring(0, 5);
        },
        closeBox() {
            this.$emit('close');
        },
        handleClickOutside(event) {
            if (this.isOpen && this.$refs.notificationBoxRef && !this.$refs.notificationBoxRef.contains(event.target)) {
                
                const toggler = document.getElementById('notification-icon-toggler'); 
                if (toggler && toggler.contains(event.target)) {
                    return;
                }
                this.closeBox();
            }
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside, true);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    }
};
</script>

<style scoped>
.notifications-box {
    position: absolute;
    top: 60px;
    /* Ajuste conforme a altura da sua navbar */
    right: 20px;
    width: 350px;
    max-height: 400px;
    background-color: white;
    border: 1px solid #ddd;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
}

.notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
}

.notifications-header h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #777;
}

.loading-state,
.error-state,
.empty-state {
    padding: 20px;
    text-align: center;
    color: #777;
}

.notifications-list {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    flex-grow: 1;
}

.notification-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;
}

.notification-item:last-child {
    border-bottom: none;
}

.notification-item.unread {
    background-color: #f8f9fa;
    /* Um pouco destacado para não lidas */
    font-weight: 500;
}

.notification-item.read {
    background-color: #fff;
    color: #6c757d;
    /* Cor mais suave para lidas */
}


.notification-item:hover {
    background-color: #e9ecef;
}

.notification-content .message {
    margin: 0 0 4px 0;
    font-size: 0.9rem;
    color: #333;
}

.notification-item.read .notification-content .message {
    color: #555;
}


.notification-content .date-time {
    font-size: 0.75rem;
    color: #888;
}

.notification-actions .btn {
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
}
</style>