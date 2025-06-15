<template>
    <div class="admin-avaliacoes-page d-flex">
        <!-- Admin Sidebar -->
        <AdminSidebar v-if="userDetails" active="admin-denuncias" :userDetails="userDetails" />

        <!-- Main Content -->
        <div class="flex-grow-1 p-4 content">
            <h2 class="mb-4 fw-bold text-primary">Gestão de Avaliações</h2>

            <div class="table-responsive bg-white rounded shadow-sm p-3">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>ID Avaliação</th>
                            <th>Autor</th>
                            <th>Avaliado</th>
                            <th>Classificação</th>
                            <th>Comentário</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="avaliacao in avaliacoes" :key="avaliacao.IdAvaliacao">
                            <td>{{ avaliacao.IdAvaliacao }}</td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <img :src="avaliacao.autor?.ImagemPerfil || 'https://via.placeholder.com/32'"
                                        alt="Autor" class="rounded-circle" width="32" height="32" />
                                    <span>{{ avaliacao.autor?.Nome }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <img :src="avaliacao.avaliado?.ImagemPerfil || 'https://via.placeholder.com/32'"
                                        alt="Avaliado" class="rounded-circle" width="32" height="32" />
                                    <span>{{ avaliacao.avaliado?.Nome }}</span>
                                </div>
                            </td>
                            <td>
                                <div class="stars">
                                    <template v-for="i in 5" :key="i">
                                        <i :class="['bi', i <= avaliacao.Classificacao ? 'bi-star-fill text-warning' : 'bi-star text-muted']"></i>
                                    </template>
                                </div>
                            </td>
                            <td>{{ avaliacao.Comentario }}</td>
                            <td>{{ formatDate(avaliacao.DataAvaliacao) }}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger" @click="handleDelete(avaliacao)">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                        <tr v-if="avaliacoes.length === 0">
                            <td colspan="7" class="text-center text-muted py-4">
                                Nenhuma avaliação encontrada.
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
import { avaliacoesService } from '@/api/avaliacoes';
import { utilizadorService } from '@/api/utilizador';

export default {
    name: 'AdminAvaliacoesView',
    components: {
        AdminSidebar
    },
    data() {
        return {
            avaliacoes: [],
            userDetails: null,
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: 12
        };
    },
    methods: {
        async fetchAvaliacoes(page = 1) {
            try {
                const response = await avaliacoesService.getAllAvaliacoes(page, this.itemsPerPage);
                this.currentPage = response.currentPage;
                this.totalPages = response.totalPages;
                this.avaliacoes = response.data;
            } catch (err) {
                console.error('Erro ao buscar avaliações:', err);
                this.avaliacoes = [];
            }
        },
        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
            this.fetchAvaliacoes(page);
        },
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('pt-PT');
        },
        async handleDelete(avaliacao) {
            if (confirm(`Tem certeza que deseja eliminar a avaliação #${avaliacao.IdAvaliacao}?`)) {
                try {
                    await avaliacoesService.deleteAvaliacao(avaliacao.IdAvaliacao);
                    this.fetchAvaliacoes();
                } catch (err) {
                    alert('Erro ao eliminar avaliação.');
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

        this.fetchAvaliacoes();
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
.admin-avaliacoes-page {
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
    display: inline-flex;
    gap: 2px;
}
</style>