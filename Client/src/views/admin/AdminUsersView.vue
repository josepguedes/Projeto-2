<template>
    <div class="admin-users-page d-flex">
        <!-- Admin Sidebar -->
        <AdminSidebar active="admin-utilizadores" :userDetails="userDetails" />

        <!-- Main Content -->
        <div class="flex-grow-1 p-4 content">
            <h2 class="mb-4 fw-bold text-primary">Gestão de Utilizadores</h2>

            <div class="table-responsive bg-white rounded shadow-sm p-3">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Foto</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Função</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.IdUtilizador">
                            <td>{{ user.IdUtilizador }}</td>
                            <td>
                                <img :src="user.ImagemPerfil || 'https://via.placeholder.com/32'" alt="User"
                                    class="rounded-circle" width="32" height="32" />
                            </td>
                            <td>{{ user.Nome }}</td>
                            <td>{{ user.Email }}</td>
                            <td>
                                <span :class="roleClass(user.Funcao)">
                                    {{ user.Funcao }}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary me-2" @click="openUserDetails(user)">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" @click="handleDelete(user)">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                        <tr v-if="users.length === 0">
                            <td colspan="6" class="text-center text-muted py-4">
                                <i class="bi bi-person-x me-2"></i>Nenhum utilizador encontrado.
                            </td>
                        </tr>
                    </tbody>
                </table>

                <nav v-if="totalPages > 1" class="mt-4">
                    <ul class="pagination justify-content-center">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <button class="page-link" @click="goToPage(currentPage - 1)">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                        </li>
                        <li v-for="page in totalPages" :key="page" class="page-item"
                            :class="{ active: page === currentPage }">
                            <button class="page-link" @click="goToPage(page)">
                                {{ page }}
                            </button>
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

        <!-- User Details Modal -->
        <AdminUserDetails v-if="selectedUser" :user="selectedUser" @close="selectedUser = null" />
    </div>
</template>

<script>
import AdminSidebar from '@/components/AdminSidebar.vue';
import AdminUserDetails from '@/components/AdminUserDetails.vue';
import { utilizadorService } from '@/api/utilizador';

export default {
    name: 'AdminUsersView',
    components: {
        AdminSidebar,
        AdminUserDetails
    },
    data() {
        return {
            users: [],
            selectedUser: null,
            userDetails: null, // adicionar esta linha
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: 12, // número de utilizadores por página
        };
    },
    methods: {
        async fetchUsers(page = 1) {
            try {
                const response = await utilizadorService.getAllUsers(page, this.itemsPerPage);
                this.users = response.data;
                this.currentPage = response.currentPage;
                this.totalPages = response.totalPages;
            } catch (err) {
                console.error('Error fetching users:', err);
                this.users = [];
            }
        },
        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.fetchUsers(page);
            this.$router.push({
                query: { ...this.$route.query, page }
            });
        },
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('pt-PT');
        },
        roleClass(role) {
            switch (role.toLowerCase()) {
                case 'admin': return 'badge bg-danger';
                case 'user': return 'badge bg-primary';
                default: return 'badge bg-secondary';
            }
        },
        openUserDetails(user) {
            this.selectedUser = user;
        },
        async handleDelete(user) {
            if (confirm(`Tem a certeza que deseja eliminar o utilizador "${user.Nome}"?`)) {
                try {
                    await utilizadorService.deleteUser(user.IdUtilizador);
                    this.fetchUsers();
                } catch (err) {
                    alert('Erro ao eliminar utilizador.');
                }
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
    },
    created() {
        // Recupera a página da URL se existir
        const page = parseInt(this.$route.query.page) || 1;
        this.currentPage = page;

        // Se não existe ?page=... na URL, força para page=1
        if (!this.$route.query.page) {
            this.$router.replace({ query: { ...this.$route.query, page: 1 } });
        }

        this.fetchUsers(page);
        this.fetchLoggedUserDetails();
    },
    watch: {
        '$route.query.page'(newPage) {
            const page = parseInt(newPage) || 1;
            if (page !== this.currentPage) {
                this.fetchUsers(page);
            }
        }
    },
};
</script>

<style scoped>
.admin-users-page {
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

.stars {
    font-size: 0.8rem;
}

.stars i {
    margin-right: 1px;
}
</style>