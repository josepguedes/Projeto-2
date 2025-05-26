<template>
    <div class="admin-notificacoes-page d-flex">
        <!-- Admin Sidebar -->
        <AdminSidebar active="admin-notificacoes" :userDetails="userDetails" />

        <!-- Main Content -->
        <div class="flex-grow-1 p-4 content">
            <h2 class="mb-4 fw-bold text-primary">Gestão de Notificações</h2>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="alert alert-danger" role="alert">
                {{ error }}
            </div>

            <!-- Content -->
            <div v-else class="table-responsive bg-white rounded shadow-sm p-3">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>ID Recipiente</th>
                            <th>Mensagem</th>
                            <th>Data Notificação</th>
                            <th>Hora Notificação</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="notificacoes.length === 0">
                            <td colspan="5" class="text-center text-muted py-4">
                                <i class="bi bi-bell-slash fs-3 d-block mb-2"></i>
                                Sem notificações encontradas
                            </td>
                        </tr>
                        <tr v-for="notificacao in notificacoes" :key="notificacao.IdNotificacao">
                            <td>{{ notificacao.IdNotificacao }}</td>
                            <td>{{ notificacao.IdRecipiente }}</td>
                            <td>{{ notificacao.Mensagem }}</td>
                            <td>{{ formatDate(notificacao.DataNotificacao) }}</td>
                            <td>{{ formatTime(notificacao.HoraNotificacao) }}</td>
                            <td>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-danger"
                                        @click="deleteNotificacao(notificacao.IdNotificacao)">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { utilizadorService } from '@/api/utilizador';
import { notificacoesService } from '@/api/notificacoes';

export default {
    name: 'AdminNotificacoesView',
    components: {
        AdminSidebar
    },
    data() {
        return {
            userDetails: null,
            notificacoes: [],
            loading: false,
            error: null
        };
    },
    methods: {
        async fetchNotificacoes() {
            try {
                this.loading = true;
                this.error = null;
                const response = await notificacoesService.getAllNotificacoes();
                this.notificacoes = response.data;
            } catch (err) {
                this.error = 'Erro ao carregar notificações';
                console.error('Erro ao buscar notificações:', err);
            } finally {
                this.loading = false;
            }
        },
        async fetchLoggedUserDetails() {
            try {
                const token = sessionStorage.getItem('token');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const response = await utilizadorService.getUserDetails(payload.IdUtilizador);
                    this.userDetails = response;
                }
            } catch (err) {
                console.error('Error fetching logged user details:', err);
            }
        },
        formatDate(date) {
            if (!date) return 'Data não definida';
            return new Date(date).toLocaleDateString('pt-PT');
        },
        formatTime(time) {
            if (!time) return 'Hora não definida';
            return time.substring(0, 5);
        },
        async deleteNotificacao(id) {
            try {
                await notificacoesService.deleteNotificacao(id);
                await this.fetchNotificacoes();
            } catch (err) {
                this.error = 'Erro ao deletar notificação';
                console.error('Error:', err);
            }
        }
    },
    created() {
        this.fetchLoggedUserDetails();
        this.fetchNotificacoes();
    }
};
</script>

<style scoped>
.admin-notificacoes-page {
    min-height: 100vh;
    background: #f8f9fa;
    padding-bottom: 100px;
}

.content {
    margin-top: 100px;
}

.table th,
.table td {
    vertical-align: middle;
}

.badge {
    font-size: 0.85rem;
    padding: 0.5em 0.75em;
}
</style>