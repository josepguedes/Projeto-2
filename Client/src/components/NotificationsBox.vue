<template>
    <div class="notifications-box" v-if="isOpen" ref="notificationBoxRef" tabindex="0">
        <div class="notifications-header">
            <h4>Notificações</h4>
            <button @click="closeBox" class="close-btn" aria-label="Fechar notificações">&times;</button>
        </div>
        <div v-if="loading" class="loading-state">
            <span class="spinner-border spinner-border-sm me-2"></span>
            A carregar...
        </div>
        <div v-if="error" class="error-state">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
        </div>
        <div v-if="!loading && !error && notificacoes.length === 0" class="empty-state">
            <i class="bi bi-bell-slash me-2"></i>Não tem notificações.
        </div>
        <ul v-if="!loading && !error && notificacoes.length > 0" class="notifications-list">
            <li v-for="notificacao in notificacoes" :key="notificacao.IdAssociacao"
                :class="['notification-item', notificacao.Estado === 'lida' ? 'read' : 'unread']">
                <div class="notification-content">
                    <p class="message mb-1">
                        <i class="bi bi-info-circle me-1"></i>{{ notificacao.Mensagem }}
                    </p>
                    <small class="date-time">
                        Recebida em: {{ formatDateTime(notificacao.DataRececaoPeloUtilizador) }}
                    </small>
                </div>
                <div class="notification-actions ms-2">
                    <button v-if="notificacao.Estado === 'não lida'" @click="marcarComoLida(notificacao.IdAssociacao)"
                        class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-check2-circle me-1"></i>Marcar como lida
                    </button>
                </div>
            </li>
        </ul>
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
        };
    },
    watch: {
        isOpen(newVal) {
            if (newVal) {
                this.getUserIdFromToken();
                if (this.currentUserId) {
                    this.fetchMinhasNotificacoes();
                    document.addEventListener('click', this.handleClickOutside, true);
                } else {
                    this.error = "Utilizador não autenticado.";
                    this.notificacoes = [];
                }
            } else {
                document.removeEventListener('click', this.handleClickOutside, true);
            }
        },
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
                // Limita às 4 mais recentes
                this.notificacoes = response.data
                    .slice(0, 4)
                    .map(n => ({
                        IdAssociacao: n.IdAssociacao,
                        Mensagem: n.Mensagem,
                        Estado: n.Estado,
                        DataRececaoPeloUtilizador: n.DataRececaoPeloUtilizador,
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
        formatDateTime(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-PT', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
                ' ' +
                date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        },
        closeBox() {
            this.$emit('close');
        },
        handleClickOutside(event) {
            if (
                this.isOpen &&
                this.$refs.notificationBoxRef &&
                !this.$refs.notificationBoxRef.contains(event.target)
            ) {
                const toggler = document.getElementById('notification-icon-toggler');
                if (toggler && toggler.contains(event.target)) {
                    return;
                }
                this.closeBox();
            }
        },
    },
    mounted() {
        this.getUserIdFromToken();
        if (this.currentUserId) {
            this.fetchMinhasNotificacoes();
        }
        if (this.isOpen) {
            document.addEventListener('click', this.handleClickOutside, true);
        }
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    },
};
</script>


<style scoped>
.notifications-box {
    position: absolute;
    top: 30px;
    right: 24px;
    width: 370px;
    max-height: 420px;
    background: #fff;
    border: 1px solid #e3e6ed;
    box-shadow: 0 8px 32px rgba(44, 62, 80, 0.13);
    border-radius: 12px;
    z-index: 1200;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.2s;
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px 12px 20px;
    border-bottom: 1px solid #f1f3f7;
    background: #f8f9fa;
    border-radius: 12px 12px 0 0;
}

.notifications-header h4 {
    margin: 0;
    font-size: 1.08rem;
    font-weight: 600;
    color: #2a8873;
    letter-spacing: 0.5px;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.7rem;
    cursor: pointer;
    color: #888;
    transition: color 0.2s;
    line-height: 1;
}

.close-btn:hover {
    color: #2a8873;
}

.loading-state,
.error-state,
.empty-state {
    padding: 32px 0 32px 0;
    text-align: center;
    color: #888;
    font-size: 1rem;
    background: #fff;
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
    align-items: flex-start;
    padding: 16px 20px 14px 20px;
    border-bottom: 1px solid #f4f4f4;
    transition: background-color 0.18s;
    gap: 8px;
}

.notification-item:last-child {
    border-bottom: none;
}

.notification-item.unread {
    background-color: #f3f8f6;
    font-weight: 600;
}

.notification-item.read {
    background-color: #fff;
    color: #6c757d;
}

.notification-item:hover {
    background-color: #e9ecef;
}

.notification-content .message {
    margin: 0 0 4px 0;
    font-size: 0.97rem;
    color: #333;
    word-break: break-word;
    line-height: 1.4;
}

.notification-item.read .notification-content .message {
    color: #555;
}

.notification-content .date-time {
    font-size: 0.78rem;
    color: #888;
}

.notification-actions .btn {
    font-size: 0.85rem;
    padding: 0.22rem 0.7rem;
    border-radius: 6px;
    margin-top: 2px;
    transition: background 0.18s, color 0.18s;
}

.notification-actions .btn-outline-primary {
    border-color: #2a8873;
    color: #2a8873;
    background: #fff;
}

.notification-actions .btn-outline-primary:hover {
    background: #2a8873;
    color: #fff;
    border-color: #2a8873;
}
</style>