<template>
    <div class="admin-bloqueios-page d-flex">
        <!-- Admin Sidebar -->
        <AdminSidebar active="admin-bloqueios" :userDetails="userDetails" />

        <!-- Main Content -->
        <div class="flex-grow-1 p-4 content">
            <h2 class="mb-4 fw-bold text-primary">Gestão de Bloqueios</h2>

            <div class="table-responsive bg-white rounded shadow-sm p-3">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Utilizador</th>
                            <th>Data de Bloqueio</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="bloqueios.length === 0">
                            <td colspan="4" class="text-center text-muted py-4">
                                <i class="bi bi-slash-circle fs-3 d-block mb-2"></i>
                                Nenhum utilizador bloqueado encontrado
                            </td>
                        </tr>
                        <tr v-for="bloqueio in bloqueios" :key="bloqueio.IdAdminBloqueados">
                            <td>{{ bloqueio.IdAdminBloqueados }}</td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <img :src="bloqueio.bloqueado?.ImagemPerfil || 'https://via.placeholder.com/32'"
                                        alt="Utilizador" class="rounded-circle" width="32" height="32">
                                    <div>
                                        <div class="fw-medium">{{ bloqueio.bloqueado?.Nome }}</div>
                                        <small class="text-muted">{{ bloqueio.bloqueado?.Email }}</small>
                                    </div>
                                </div>
                            </td>
                            <td>{{ formatDate(bloqueio.DataBloqueio) }}</td>
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

                <!-- Pagination -->
                <nav v-if="totalPages > 1" class="mt-4">
                    <ul class="pagination justify-content-center">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <button class="page-link" @click="goToPage(currentPage - 1)">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                        </li>
                        <li v-for="page in totalPages" :key="page" class="page-item"
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
            userDetails: null,
            bloqueios: [],
            loading: true,
            error: null,
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: 10
        }
    },
    methods: {
        async fetchBloqueios(page = 1) {
            try {
                this.loading = true;
                this.error = null;

                // Primeiro carrega os detalhes do usuário se necessário
                if (!this.userDetails) {
                    await this.fetchLoggedUserDetails();
                }

                const response = await adminBloqueiosService.getAllBloqueios(page, this.itemsPerPage);
                this.bloqueios = response.data;
                this.currentPage = response.currentPage;
                this.totalPages = response.totalPages;
            } catch (error) {
                console.error('Erro ao buscar bloqueios:', error);
                this.error = error.message || 'Erro ao carregar utilizadores bloqueados';
            } finally {
                this.loading = false;
            }
        },
        async fetchLoggedUserDetails() {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    this.$router.push('/login');
                    return;
                }

                const payload = JSON.parse(atob(token.split('.')[1]));
                const response = await utilizadorService.getUserDetails(payload.IdUtilizador);

                if (response) {
                    this.userDetails = response;
                } else {
                    throw new Error('Detalhes do usuário não encontrados');
                }
            } catch (err) {
                console.error('Error fetching logged user details:', err);
                this.error = 'Erro ao carregar detalhes do usuário';
                this.$router.push('/login');
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
        try {
            await this.fetchLoggedUserDetails();

            if (!this.userDetails) {
                throw new Error('Detalhes do usuário não encontrados');
            }

            const page = parseInt(this.$route.query.page) || 1;
            await this.fetchBloqueios(page);
        } catch (error) {
            console.error('Error in created hook:', error);
            this.error = error.message;
        }
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

.btn-sm {
    padding: 0.4rem 0.8rem;
}
</style>