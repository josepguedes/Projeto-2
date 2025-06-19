<template>
    <div class="admin-users-page d-flex">
        <!-- Admin Sidebar -->
        <AdminSidebar v-if="userDetails" active="admin-denuncias" :userDetails="userDetails" />

        <!-- Main Content -->
        <div class="flex-grow-1 p-4 content">
            <h2 class="mb-4 fw-bold text-primary">Gestão de Utilizadores</h2>

            <div class="table-responsive bg-white rounded shadow-sm p-3">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Utilizador</th>
                            <th>Email</th>
                            <th>Função</th>
                            <th>Estado</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.IdUtilizador">
                            <td>{{ user.IdUtilizador }}</td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <img :src="user.ImagemPerfil || 'https://via.placeholder.com/32'" alt="Utilizador"
                                        class="rounded-circle" width="32" height="32">
                                    <div class="fw-medium">{{ user.Nome }}</div>
                                </div>
                            </td>
                            <td>{{ user.Email }}</td>
                            <td> <span :class="roleClass(user.Funcao)">
                                    {{ user.Funcao }}
                                </span></td>
                            <td>
                                <div v-if="user.bloqueio" class="text-danger">
                                    <span class="badge bg-danger">Bloqueado</span>
                                    <small class="d-block">
                                        Desde: {{ formatDate(user.bloqueio.DataBloqueio) }}<br>
                                        {{ user.bloqueio.DataFimBloqueio ?
                                            `Até: ${formatDate(user.bloqueio.DataFimBloqueio)}` :
                                            'Bloqueio permanente' }}
                                    </small>
                                </div>
                                <span v-else class="badge bg-success">Ativo</span>
                            </td>
                            <td>
                                <div class="d-flex align-items-center gap-3"> <!-- Alterado para gap-3 -->
                                    <button class="btn btn-sm btn-primary" @click="viewUserDetails(user)"
                                        title="Ver Detalhes">
                                        <i class="bi bi-eye"></i>
                                    </button>

                                    <button @click="handleBlockClick(user)"
                                        :class="['btn btn-sm', user.bloqueio ? 'btn-success' : 'btn-danger']"
                                        :title="user.bloqueio ? 'Desbloquear Utilizador' : 'Bloquear Utilizador'">
                                        <i :class="['bi', user.bloqueio ? 'bi-unlock' : 'bi-lock']"></i>
                                    </button>
                                </div>
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
        <AdminUserDetails v-if="showDetailsModal" :user="selectedUser" @close="closeDetailsModal" />

        <AdminBlockModal ref="blockModal" :user="selectedUserForBlock" :isBlocked="!!selectedUserForBlock?.bloqueio"
            @submit="handleBlockSubmit" />
    </div>
</template>

<script>
import AdminSidebar from '@/components/AdminSidebar.vue';
import AdminUserDetails from '@/components/AdminUserDetails.vue';
import { utilizadorService } from '@/api/utilizador';
import { adminBloqueiosService } from '@/api/adminBloqueios';
import AdminBlockModal from '@/components/AdminBlockModal.vue';

export default {
    name: 'AdminUsersView',
    components: {
        AdminSidebar,
        AdminUserDetails,
        AdminBlockModal
    },
    data() {
        return {
            users: [],
            selectedUser: null,
            selectedUserForBlock: null,
            showDetailsModal: false,
            userDetails: {}, // Inicializar como objeto vazio em vez de null
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: 12,
        };
    },
    methods: {
        viewUserDetails(user) {
            this.selectedUser = user;
            this.showDetailsModal = true;
        },

        closeDetailsModal() {
            this.showDetailsModal = false;
            this.selectedUser = null;
        },

        handleBlockClick(user) {
            this.selectedUserForBlock = user;
            this.$refs.blockModal.showModal();
        },
        roleClass(role) {
            switch (role.toLowerCase()) {
                case 'admin':
                    return 'badge bg-danger';
                case 'moderador':
                    return 'badge bg-warning';
                case 'utilizador':
                    return 'badge bg-primary';
                default:
                    return 'badge bg-secondary';
            }
        },
        async fetchUsers(page = 1) {
            try {
                const response = await utilizadorService.getAllUsers(page, this.itemsPerPage);

                // Buscar informações de bloqueio para cada usuário
                const usersWithBlocks = await Promise.all(response.data.map(async user => {
                    try {
                        const bloqueioInfo = await adminBloqueiosService.checkAdminBlock(user.IdUtilizador);
                        return {
                            ...user,
                            bloqueio: bloqueioInfo.bloqueio
                        };
                    } catch (error) {
                        console.error(`Erro ao buscar bloqueio para usuário ${user.IdUtilizador}:`, error);
                        return user;
                    }
                }));

                this.users = usersWithBlocks;
                this.currentPage = response.currentPage;
                this.totalPages = response.totalPages;
            } catch (error) {
                console.error('Erro ao buscar usuários:', error);
                alert('Erro ao carregar usuários');
            }
        },
        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.fetchUsers(page);
            this.$router.push({
                query: { ...this.$route.query, page }
            });
        },

        async handleBlockSubmit(blockData) {
            try {
                if (this.selectedUserForBlock.bloqueio) {
                    // Chamar deleteBloqueio com o ID do bloqueio, não do usuário
                    await adminBloqueiosService.deleteBloqueio(this.selectedUserForBlock.bloqueio.IdAdminBloqueados);
                } else {
                    await adminBloqueiosService.createBloqueio(
                        this.selectedUserForBlock.IdUtilizador,
                        blockData.blockType === 'permanent' ? null : blockData.endDate
                    );
                }
                await this.fetchUsers(this.currentPage);
                this.$refs.blockModal.hideModal();
                this.selectedUserForBlock = null;
            } catch (error) {
                console.error('Erro ao bloquear/desbloquear:', error);
                alert('Erro ao processar a operação: ' + error.message);
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