<template>
    <div class="notifications-box">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-primary mb-0">Notificações</h5>
            <button class="btn-close" aria-label="Fechar" @click="$emit('close')"></button>
        </div>
        <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
        </div>
        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>
        <ul v-else class="list-group notifications-list">
            <li v-if="notificacoes.length === 0" class="list-group-item text-muted text-center">
                <i class="bi bi-bell-slash me-2"></i>Sem notificações
            </li>
            <li
                v-for="notificacao in notificacoes"
                :key="notificacao.IdNotificacao"
                class="list-group-item d-flex align-items-center"
            >
                <i class="bi bi-bell-fill text-primary me-2"></i>
                <div>
                    <div class="fw-medium">{{ notificacao.Mensagem }}</div>
                    <div class="small text-muted">
                        {{ formatDate(notificacao.DataNotificacao) }}
                        {{ formatTime(notificacao.HoraNotificacao) }}
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { notificacoesService } from '@/api/notificacoes';

export default {
    name: 'NotificationsBox',
    data() {
        return {
            notificacoes: [],
            loading: false,
            error: null,
        };
    },
    methods: {
        async fetchNotificacoes() {
            this.loading = true;
            this.error = null;
            try {
                const response = await notificacoesService.getAllNotificacoes(1, 5);
                this.notificacoes = response.data;
            } catch (err) {
                this.error = 'Erro ao carregar notificações';
            } finally {
                this.loading = false;
            }
        },
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('pt-PT');
        },
        formatTime(time) {
            if (!time) return '';
            return time.substring(0, 5);
        },
    },
    created() {
        this.fetchNotificacoes();
    },
};
</script>

<style scoped>
.notifications-box {
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    padding: 1.5rem;
    min-width: 300px;
    max-width: 400px;
}
.notifications-list {
    margin: 0;
    padding: 0;
    list-style: none;
}
.list-group-item {
    border: none;
    border-bottom: 1px solid #f0f0f0;
    padding: 0.75rem 0.5rem;
}
.list-group-item:last-child {
    border-bottom: none;
}
.btn-close {
    color: black;
    background: transparent;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    line-height: 1;
    opacity: 1;
    position: relative;
    width: 1.5em;
    height: 1.5em;
}
.btn-close::before, .btn-close::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 1em;
    height: 2px;
    background: currentColor;
    transform-origin: center;
}
.btn-close::before {
    transform: translate(-50%, -50%) rotate(45deg);
}
.btn-close::after {
    transform: translate(-50%, -50%) rotate(-45deg);
}
</style>