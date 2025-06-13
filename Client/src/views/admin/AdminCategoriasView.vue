<template>
    <div class="admin-categorias-page d-flex">
        <AdminSidebar active="admin-categorias" :userDetails="userDetails" />

        <div class="flex-grow-1 p-4 content">
            <h2 class="mb-4 fw-bold text-primary">Gestão de Categorias</h2>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </div>

            <div v-else-if="error" class="alert alert-danger" role="alert">
                {{ error }}
            </div>

            <div v-else class="table-responsive bg-white rounded shadow-sm p-3">
                <div class="d-flex justify-content-end mb-3">
                    <button class="btn btn-primary" @click="showAddModal">
                        <i class="bi bi-plus-circle me-2"></i>Nova Categoria
                    </button>
                </div>

                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="categorias.length === 0">
                            <td colspan="3" class="text-center text-muted py-4">
                                <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                                Nenhuma categoria encontrada
                            </td>
                        </tr>
                        <tr v-for="categoria in categorias" :key="categoria.IdProdutoCategoria">
                            <td>{{ categoria.IdProdutoCategoria }}</td>
                            <td>{{ categoria.NomeCategoria }}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger"
                                    @click="deleteCategoria(categoria.IdProdutoCategoria)">
                                    <i class="bi bi-trash"></i>
                                </button>
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

        <!-- Modal para adicionar categoria -->
        <div class="modal fade" id="addCategoriaModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Nova Categoria</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Nome da Categoria</label>
                            <input type="text" class="form-control" v-model="novaCategoria.NomeCategoria">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" @click="createCategoria">Adicionar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AdminSidebar from '@/components/AdminSidebar.vue';
import { utilizadorService } from '@/api/utilizador';
import { produtoCategoriaService } from '@/api/produtoCategoria';
import { Modal } from 'bootstrap';


export default {
    name: 'AdminCategoriasView',
    components: {
        AdminSidebar
    },
    data() {
        return {
            categorias: [],
            loading: true,
            error: null,
            modal: null,
            userDetails: null,
            novaCategoria: {
                NomeCategoria: ''
            },
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: 10
        };
    },
    methods: {
        async fetchCategorias(page = 1) {
            try {
                this.loading = true;
                const response = await produtoCategoriaService.getAllCategorias(page, this.itemsPerPage);
                this.currentPage = response.currentPage;
                this.totalPages = response.totalPages;
                this.categorias = response.data;
            } catch (err) {
                this.error = 'Erro ao carregar categorias';
                console.error('Erro:', err);
            } finally {
                this.loading = false;
            }
        },
        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
            this.fetchCategorias(page);
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
        showAddModal() {
            this.novaCategoria.NomeCategoria = '';
            this.modal.show();
        },
        async createCategoria() {
            try {
                await produtoCategoriaService.createCategoria(this.novaCategoria);
                this.modal.hide();
                await this.fetchCategorias();
            } catch (err) {
                alert('Erro ao criar categoria');
                console.error('Erro:', err);
            }
        },
        async deleteCategoria(id) {
            if (confirm('Tem certeza que deseja eliminar esta categoria?')) {
                try {
                    await produtoCategoriaService.deleteCategoria(id);
                    await this.fetchCategorias();
                } catch (err) {
                    alert('Erro ao eliminar categoria');
                    console.error('Erro:', err);
                }
            }
        }
    },
    mounted() {
        this.modal = new Modal(document.getElementById('addCategoriaModal'));
    },
    created() {
        // Recupera a página da URL se existir
        const page = parseInt(this.$route.query.page) || 1;
        this.currentPage = page;

        // Se não existe ?page=... na URL, força para page=1
        if (!this.$route.query.page) {
            this.$router.replace({ query: { ...this.$route.query, page: 1 } });
        }

        this.fetchCategorias();
        this.fetchLoggedUserDetails();
    },

    watch: {
        '$route.query.page'(newPage) {
            const page = parseInt(newPage) || 1;
            if (page !== this.currentPage) {
                this.fetchReservas(page);
            }
        }
    },
};
</script>

<style scoped>
.admin-categorias-page {
    min-height: 100vh;
    background: #f8f9fa;
}

.content {
    margin-top: 100px;
    padding-bottom: 100px;
}
</style>