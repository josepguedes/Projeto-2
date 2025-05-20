<template>
    <div class="admin-categorias-page d-flex">
        <!-- Admin Sidebar -->
        <AdminSidebar active="admin-categorias" :userDetails="userDetails" />

        <!-- Main Content -->
        <div class="flex-grow-1 p-4 content">
            <h2 class="mb-4 fw-bold text-primary">Gestão de Categorias</h2>

            <div class="table-responsive bg-white rounded shadow-sm p-3">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>ID Categoria</th>
                            <th>Nome</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="categorias.length === 0">
                            <td colspan="3" class="text-center text-muted py-4">
                                <i class="bi bi-folder fs-3 d-block mb-2"></i>
                                Nenhuma categoria encontrada.
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

export default {
    name: 'AdminCategoriasView',
    components: {
        AdminSidebar
    },
    data() {
        return {
            categorias: [],
            userDetails: null
        };
    },
    methods: {
        async fetchCategorias() {
            try {
                // TODO: Implement categorias service
                this.categorias = [];
            } catch (err) {
                console.error('Erro ao buscar categorias:', err);
                this.categorias = [];
            }
        },
        async handleDelete(categoria) {
            if (confirm(`Tem certeza que deseja eliminar a categoria "${categoria.Nome}"?`)) {
                try {
                    // TODO: Implement delete categoria
                    this.fetchCategorias();
                } catch (err) {
                    alert('Erro ao eliminar categoria.');
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
        this.fetchCategorias();
        this.fetchLoggedUserDetails();
    }
};
</script>

<style scoped>
.admin-categorias-page {
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