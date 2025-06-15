<template>
    <div class="admin-reservas-page d-flex">
        <!-- Admin Sidebar -->
        <AdminSidebar v-if="userDetails" active="admin-denuncias" :userDetails="userDetails" />>

        <!-- Main Content -->
        <div class="flex-grow-1 p-4 content">
            <h2 class="mb-4 fw-bold text-primary">Gestão de Reservas</h2>

            <div class="table-responsive bg-white rounded shadow-sm p-3">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>ID Reserva</th>
                            <th>Anúncio</th>
                            <th>Cliente</th>
                            <th>Vendedor</th>
                            <th>Data Reserva</th>
                            <th>Estado</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="reserva in reservas" :key="reserva.IdAnuncio">
                            <td>{{ reserva.IdAnuncio }}</td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <img :src="reserva.ImagemAnuncio || 'https://via.placeholder.com/32'" alt="Produto"
                                        class="rounded" width="32" height="32" />
                                    <span>{{ reserva.Nome }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <img :src="reserva.reservador?.ImagemPerfil || 'https://via.placeholder.com/32'"
                                        alt="Cliente" class="rounded-circle" width="32" height="32" />
                                    <span>{{ reserva.reservador?.Nome || 'N/A' }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <img :src="reserva.utilizador?.ImagemPerfil || 'https://via.placeholder.com/32'"
                                        alt="Vendedor" class="rounded-circle" width="32" height="32" />
                                    <span>{{ reserva.utilizador?.Nome || 'N/A' }}</span>
                                </div>
                            </td>
                            <td>{{ formatDate(reserva.DataReserva) }}</td>
                            <td>
                                <span :class="getStatusClass(reserva.IdEstadoAnuncio)">
                                    {{ getStatusText(reserva.IdEstadoAnuncio) }}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" @click="handleDelete(reserva)">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                        <tr v-if="reservas.length === 0">
                            <td colspan="7" class="text-center text-muted py-4">
                                <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                                Sem reservas encontradas
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
import { utilizadorService } from '@/api/utilizador';
import { anunciosService } from '@/api/anuncio';

export default {
    name: 'AdminReservasView',
    components: {
        AdminSidebar
    },
    data() {
        return {
            reservas: [],
            userDetails: null,
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: 10
        };
    },
    methods: {
        async fetchReservas(page = 1) {
            try {
                const response = await anunciosService.getAllReservas(page, this.itemsPerPage);
                this.reservas = response.data;
                this.currentPage = response.currentPage;
                this.totalPages = response.totalPages;
            } catch (err) {
                console.error('Error fetching reservas:', err);
            }
        },
        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.$router.push({
                query: { ...this.$route.query, page }
            });
        },
        formatDate(date) {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('pt-PT');
        },
        getStatusClass(status) {
            const classes = {
                1: 'badge bg-success',
                2: 'badge bg-warning text-dark',
                3: 'badge bg-secondary',
                4: 'badge bg-danger',
                5: 'badge bg-info text-dark',
                6: 'badge bg-primary'
            };
            return classes[status] || 'badge bg-secondary';
        },
        getStatusText(status) {
            const texts = {
                1: 'Disponível',
                2: 'Reservado',
                3: 'Expirado',
                4: 'Cancelado',
                5: 'Concluído',
                6: 'Por Pagar'
            };
            return texts[status] || 'Desconhecido';
        },
        async handleDelete(reserva) {
            if (confirm(`Tem certeza que deseja cancelar a reserva do anúncio "${reserva.Nome}"?`)) {
                try {
                    await anunciosService.updateAnuncio(reserva.IdAnuncio, {
                        IdEstadoAnuncio: 1,
                        IdUtilizadorReserva: null,
                        DataReserva: null,
                        CodigoVerificacao: null
                    });
                    this.fetchReservas(this.currentPage);
                } catch (err) {
                    alert('Erro ao cancelar reserva.');
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

        this.fetchReservas();
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
.admin-reservas-page {
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

.bi-inbox {
    color: #6c757d;
}
</style>