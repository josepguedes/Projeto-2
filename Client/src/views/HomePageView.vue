<template>
    <div class="landing-page">
        <!-- Header and Search Section -->
        <header class="text-center py-4">
            <h1 class="display-4 font-weight-bold text-primary">FoodShare</h1>
            <p class="lead mt-2">Partilha alimentos. Encontra o que precisas</p>

            <!-- Search Bar -->
            <div class="container mt-4">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" placeholder="Procurar alimentos..."
                                v-model="searchTerm" @input="handleSearch">
                            <button class="btn btn-primary" type="button">
                                Procurar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="container mt-4">
            <!-- Loading State -->
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="alert alert-danger" role="alert">
                {{ error }}
            </div>

            <!-- Content -->
            <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                <div v-for="anuncio in anuncios" :key="anuncio.IdAnuncio" class="col">
                    <FoodCard :food="{
                        name: anuncio.Nome,
                        location: anuncio.LocalRecolha,
                        date: formatDate(anuncio.DataRecolha),
                        price: formatPrice(anuncio.Preco),
                        image: anuncio.ImagemAnuncio || 'https://via.placeholder.com/500'
                    }" />
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
                <nav aria-label="Page navigation">
                    <ul class="pagination">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Anterior</a>
                        </li>
                        <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Próxima</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </main>
    </div>
</template>

<script>
import FoodCard from '@/components/FoodCard.vue'
import { anunciosService } from '@/api/anuncio'

export default {
    name: 'LandingPage',
    components: {
        FoodCard
    },
    data() {
        return {
            searchTerm: '',
            anuncios: [],
            loading: true,
            error: null,
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: 12
        }
    },
    methods: {
        async fetchAnuncios() {
            try {
                this.loading = true;
                this.error = null;
                const filters = this.searchTerm ? { nome: this.searchTerm } : {};
                const response = await anunciosService.getAllAnuncios(
                    this.currentPage,
                    this.itemsPerPage,
                    filters
                );
                this.anuncios = response.data;
                this.totalPages = response.totalPages;
                this.currentPage = response.currentPage;
            } catch (err) {
                this.error = 'Erro ao carregar os anúncios. Por favor, tente novamente.';
                console.error('Erro:', err);
            } finally {
                this.loading = false;
            }
        },
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long'
            });
        },
        formatPrice(price) {
            if (!price) return '0,00€';
            return Number(price).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'EUR'
            });
        },
        async handleSearch() {
            this.currentPage = 1;
            await this.fetchAnuncios();
        },
        async changePage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
            await this.fetchAnuncios();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },
    async created() {
        await this.fetchAnuncios();
    }
}
</script>

<style scoped>
.landing-page {
    padding-top: 120px;
    padding-bottom: 120px;
    min-height: 100vh;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
}

.nav-link {
    font-weight: 500;
    transition: color 0.2s ease;
}

.nav-link:hover {
    color: #007bff !important;
}

.pagination {
    margin-bottom: 0;
}

.spinner-border {
    width: 3rem;
    height: 3rem;
}
</style>