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
            userDetails: null
        };
    },
    methods: {
        async fetchDenuncias() {
            try {
                const response = await denunciasService.getAllDenuncias(1, 100);
                this.denuncias = response.data;
            } catch (err) {
                console.error('Erro ao buscar denúncias:', err);
                this.denuncias = [];
            }
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
        this.fetchDenuncias();
        this.fetchLoggedUserDetails();
    }
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