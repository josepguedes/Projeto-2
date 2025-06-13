<template>
    <div class="admin-denuncias-page d-flex">
        <!-- Admin Sidebar -->
        <AdminSidebar active="admin-denuncias" :userDetails="userDetails" />

        <!-- Main Content -->
        <div class="flex-grow-1 p-4 content">
            <h2 class="mb-4 fw-bold text-primary">Gestão de Denúncias</h2>

            <div class="table-responsive bg-white rounded shadow-sm p-3">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>ID Denúncia</th>
                            <th>Utilizador Denunciado</th>
                            <th>Motivo</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="denuncia in denuncias" :key="denuncia.IdDenuncia">
                            <td>{{ denuncia.IdDenuncia }}</td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <img :src="denuncia.utilizadorDenunciado?.ImagemPerfil || 'https://via.placeholder.com/32'"
                                        alt="User" class="rounded-circle" width="32" height="32" />
                                    <span>{{ denuncia.utilizadorDenunciado?.Nome }}</span>
                                </div>
                            </td>
                            <td>{{ denuncia.Motivo }}</td>
                            <td>{{ formatDate(denuncia.DataDenuncia) }}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" @click="handleDelete(denuncia)">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                        <tr v-if="denuncias.length === 0">
                            <td colspan="6" class="text-center text-muted py-4">
                                Nenhuma denúncia encontrada.
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
    </div>
</template>

<script>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { denunciasService } from '@/api/denuncia';
import { utilizadorService } from '@/api/utilizador';

export default {
    name: 'AdminDenunciasView',
    components: {
        AdminSidebar
    },
    data() {
        return {
            denuncias: [],
            userDetails: null,
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: 12, // número de utilizadores por página
        };
    },
    methods: {
        async fetchDenuncias(page = 1) {
            try {
                const response = await denunciasService.getAllDenuncias(page, this.itemsPerPage);
                this.denuncias = response.data;
                this.currentPage = response.currentPage;
                this.totalPages = response.totalPages;
            } catch (err) {
                console.error('Erro ao buscar denúncias:', err);
                this.denuncias = [];
            }
        },
        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
            this.fetchDenuncias(page);
        },
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('pt-PT');
        },
        async handleDelete(denuncia) {
            if (confirm(`Tem certeza que deseja eliminar a denúncia #${denuncia.IdDenuncia}?`)) {
                try {
                    await denunciasService.deleteDenuncia(denuncia.IdDenuncia);
                    this.fetchDenuncias();
                } catch (err) {
                    alert('Erro ao eliminar denúncia.');
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
        }
    },
    created() {

        // Recupera a página da URL se existir
        const page = parseInt(this.$route.query.page) || 1;
        this.currentPage = page;

        // Se não existe ?page=... na URL, força para page=1
        if (!this.$route.query.page) {
            this.$router.replace({ query: { ...this.$route.query, page: 1 } });
        }


        this.fetchDenuncias();
        this.fetchLoggedUserDetails();
    },

    watch: {
        '$route.query.page'(newPage) {
            const page = parseInt(newPage) || 1;
            if (page !== this.currentPage) {
                this.fetchAnuncios(page);
            }
        }
    },
};
</script>

<style scoped>
.admin-denuncias-page {
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
</style>