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
            userDetails: null // adicionar esta linha
        };
    },
    methods: {
        async fetchUsers() {
            try {
                const response = await utilizadorService.getAllUsers();
                this.users = response;
            } catch (err) {
                console.error('Error fetching users:', err);
                this.users = [];
            }
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
        this.fetchUsers();
        this.fetchLoggedUserDetails();
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