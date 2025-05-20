<template>
    <div class="admin-anuncios-page d-flex">
        <!-- Admin Sidebar -->
        <AdminSidebar active="admin-anuncios" :userDetails="userDetails" />

        <!-- Main Content -->
        <div class="flex-grow-1 p-4 content">
            <h2 class="mb-4 fw-bold text-primary">Gestão de Anúncios</h2>

            <div class="table-responsive bg-white rounded shadow-sm p-3">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Nome Anúncio</th>
                            <th>Utilizador</th>
                            <th>Local Recolha</th>
                            <th>Preço</th>
                            <th>Quantidade</th>
                            <th>Categoria</th>
                            <th>Data Anúncio</th>
                            <th>Estado</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="anuncio in anuncios" :key="anuncio.IdAnuncio">
                            <td>{{ anuncio.IdAnuncio }}</td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <img :src="anuncio.ImagemAnuncio || 'https://via.placeholder.com/32'" alt="Produto"
                                        class="rounded" width="32" height="32" style="object-fit: cover;" />
                                    <span>{{ anuncio.Nome }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <img :src="anuncio.utilizador?.ImagemPerfil || 'https://via.placeholder.com/32'"
                                        alt="User" class="rounded-circle" width="32" height="32" />
                                    <span>{{ anuncio.utilizador?.Nome || 'N/A' }}</span>
                                </div>
                            </td>
                            <td>{{ anuncio.LocalRecolha }}</td>
                            <td>{{ formatPrice(anuncio.Preco) }}</td>
                            <td>{{ anuncio.Quantidade }}</td>
                            <td>{{ anuncio.Categoria || anuncio.IdProdutoCategoria }}</td>
                            <td>{{ formatDate(anuncio.DataAnuncio) }}</td>
                            <td>
                                <span :class="estadoClass(anuncio.IdEstadoAnuncio)">
                                    {{ anuncio.estado?.EstadoAnuncio || estadoLabel(anuncio.IdEstadoAnuncio) }}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary me-2" @click="handleEdit(anuncio)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" @click="handleDelete(anuncio)">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                        <tr v-if="anuncios.length === 0">
                            <td colspan="10" class="text-center text-muted py-4">Nenhum anúncio encontrado.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import AdminSidebar from '@/components/AdminSidebar.vue';
import AdminUserDetails from '@/components/AdminUserDetails.vue';
import { anunciosService } from '@/api/anuncio';
import { utilizadorService } from '@/api/utilizador';

export default {
    name: 'AdminAnunciosView',
    components: {
        AdminSidebar,
        AdminUserDetails
    },
    data() {
        return {
            anuncios: [],
            userDetails: null // adicionar esta linha
        };
    },
    methods: {
        async fetchAnuncios() {
            try {
                const response = await anunciosService.getAllAnuncios(1, 100);
                this.anuncios = response.data;
            } catch (err) {
                this.anuncios = [];
            }
        },
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('pt-PT');
        },
        formatPrice(price) {
            if (!price) return '0,00€';
            return Number(price).toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR',
            });
        },
        estadoClass(estado) {
            switch (estado) {
                case 1: return 'badge bg-success';
                case 2: return 'badge bg-warning text-dark';
                case 3: return 'badge bg-secondary';
                case 4: return 'badge bg-danger';
                case 5: return 'badge bg-info text-dark';
                default: return 'badge bg-light text-dark';
            }
        },
        handleEdit(anuncio) {
            // Implementar lógica de edição (abrir modal, etc)
            alert(`Editar anúncio #${anuncio.IdAnuncio}`);
        },
        async handleDelete(anuncio) {
            if (confirm(`Tem a certeza que deseja eliminar o anúncio "${anuncio.Nome}"?`)) {
                try {
                    await anunciosService.deleteAnuncio(anuncio.IdAnuncio);
                    this.fetchAnuncios();
                } catch (err) {
                    alert('Erro ao eliminar anúncio.');
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
        this.fetchAnuncios();
        this.fetchLoggedUserDetails();
    },
};
</script>

<style scoped>
.admin-anuncios-page {
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