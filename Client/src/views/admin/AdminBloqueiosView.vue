<template>
    <div class="admin-bloqueios-page d-flex">
        <AdminSidebar v-if="userDetails" :userDetails="userDetails" />
        <div class="container">
            <div class="content">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="mb-0">Utilizadores Bloqueados</h2>
                </div>

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
                <div v-else>
                    <div v-if="bloqueios.length === 0" class="text-center text-muted py-4">
                        <i class="bi bi-slash-circle fs-3 d-block mb-2"></i>
                        Nenhum utilizador bloqueado encontrado
                    </div>
                    <div v-else>
                        <div class="card">
                            <div class="table-responsive">
                                <table class="table table-hover align-middle m-0">
                                    <thead>
                                        <tr>
                                            <th>Utilizador</th>
                                            <th>Data de Bloqueio</th>
                                            <th>Motivo</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="bloqueio in bloqueios" :key="bloqueio.IdAdminBloqueados">
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <img :src="bloqueio.bloqueado.ImagemPerfil" alt="Utilizador"
                                                        class="rounded-circle me-2" width="32" height="32">
                                                    <div>
                                                        <div class="fw-medium">{{ bloqueio.bloqueado.Nome }}</div>
                                                        <small class="text-muted">{{ bloqueio.bloqueado.Email }}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{{ formatDate(bloqueio.DataBloqueio) }}</td>
                                            <td>{{ bloqueio.Motivo || 'Não especificado' }}</td>
                                            <td>
                                                <button @click="handleDesbloquear(bloqueio.IdAdminBloqueados)"
                                                    class="btn btn-sm btn-outline-primary">
                                                    <i class="bi bi-unlock me-1"></i>
                                                    Desbloquear
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <nav v-if="totalPages > 1" class="mt-4">
                            <ul class="pagination justify-content-center">
                                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                    <button class="page-link" @click="goToPage(currentPage - 1)">
                                        <i class="bi bi-chevron-left"></i>
                                    </button>
                                </li>
                                <li class="page-item" v-for="page in totalPages" :key="page"
                                    :class="{ active: page === currentPage }">
                                    <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                                </li>
                                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                    <button class="page-link" @click="goToPage(currentPage + 1)">
                                        <i class="bi bi-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { adminBloqueiosService } from '@/api/adminBloqueios';
import { utilizadorService } from '@/api/utilizador';

export default {
    name: 'AdminBloqueiosView',
    components: {
        AdminSidebar
    },
    data() {
        return {
            userDetails: null,  // Add this
            bloqueios: [],
            loading: true,
            error: null,
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: 10
        }
    },
    methods: {
        async fetchLoggedUserDetails() {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    this.$router.push('/login');
                    return;
                }

                const payload = JSON.parse(atob(token.split('.')[1]));
                const response = await utilizadorService.getUserDetails(payload.IdUtilizador);
                this.userDetails = response;
            } catch (err) {
                console.error('Error fetching logged user details:', err);
                this.error = 'Erro ao carregar detalhes do usuário';
            }
        },
        async handleDesbloquear(idBloqueio) {
            try {
                const confirmacao = confirm('Tem certeza que deseja desbloquear este utilizador?');
                if (confirmacao) {
                    await adminBloqueiosService.deleteBloqueio(idBloqueio);
                    await this.fetchBloqueios(this.currentPage);
                }
            } catch (error) {
                console.error('Erro ao desbloquear:', error);
                alert('Erro ao desbloquear utilizador');
            }
        },
        formatDate(date) {
            if (!date) return 'Data não definida';
            return new Date(date).toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.$router.push({ query: { ...this.$route.query, page } });
        }
    },
    async created() {
        // Carrega os detalhes do usuário primeiro
        await this.fetchLoggedUserDetails();

        const page = parseInt(this.$route.query.page) || 1;
        this.currentPage = page;

        if (!this.$route.query.page) {
            this.$router.replace({ query: { ...this.$route.query, page: 1 } });
        }

        await this.fetchBloqueios(page);
    },
    watch: {
        '$route.query.page'(newPage) {
            const page = parseInt(newPage) || 1;
            if (page !== this.currentPage) {
                this.fetchBloqueios(page);
            }
        }
    }
}
</script>

<style scoped>
.admin-bloqueios-page {
    padding-top: 80px;
    padding-bottom: 40px;
    min-height: 100vh;
    background: #f8f9fa;
}

.content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 2rem;
}

.table th {
    font-weight: 600;
    color: #495057;
}

.table td {
    vertical-align: middle;
}

.btn-sm {
    padding: 0.4rem 0.8rem;
}
</style>