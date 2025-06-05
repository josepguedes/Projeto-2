<template>
  <div class="landing-page">
    <div class="container">
      <!-- Search Section -->
      <div class="search-section text-center mb-5">
        <h1 class="display-4 mb-4 title">Encontre Produtos Próximos</h1>
        <div class="search-bar mx-auto">
          <div class="input-group">
            <input type="text" class="form-control" v-model="searchTerm" @keyup.enter="handleSearch"
              placeholder="Pesquisar produtos...">
            <button class="btn btn-primary" @click="handleSearch">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
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
            id: anuncio.IdAnuncio,
            name: anuncio.Nome,
            location: anuncio.LocalRecolha,
            date: formatDate(anuncio.DataRecolha),
            price: formatPrice(anuncio.Preco),
            image: anuncio.ImagemAnuncio || 'https://via.placeholder.com/500',
          }" />
        </div>
      </div>

      <!-- Pagination -->
      <!-- Substitui o bloco de paginação atual por este -->
      <nav v-if="totalPages > 1" class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(currentPage - 1)">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
            <button class="page-link" @click="goToPage(page)">{{ page }}</button>
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
</template>

<script>
import { anunciosService } from "@/api/anuncio";
import FoodCard from "@/components/FoodCard.vue";

export default {
  name: "LandingPage",
  components: { FoodCard },
  data() {
    return {
      searchTerm: "",
      anuncios: [],
      loading: true,
      error: null,
      links: [],
    };
  },
  methods: {
    async fetchAnuncios(page = 1) {
      try {
        this.loading = true;
        this.error = null;
        const filters = this.searchTerm ? { nome: this.searchTerm } : {};

        const response = await anunciosService.getAllAnuncios(
          page,
          this.itemsPerPage,
          filters
        );

        this.anuncios = response.data;
        this.links = response.links;
        this.currentPage = response.currentPage; // <-- do backend!
        this.totalPages = response.totalPages;   // <-- do backend!

        // Atualiza a URL com a página atual
        this.$router.push({
          query: {
            ...this.$route.query,
            page: this.currentPage
          }
        });
      } catch (err) {
        this.error = "Erro ao carregar os anúncios. Por favor, tente novamente.";
        console.error("Erro:", err);
      } finally {
        this.loading = false;
      }
    },
    goToPage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.fetchAnuncios(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    async handleSearch() {
      this.currentPage = 1;
      await this.fetchAnuncios(1);
    },
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
      });
    },
    formatPrice(price) {
      if (!price) return "0,00€";
      return Number(price).toLocaleString("pt-BR", {
        style: "currency",
        currency: "EUR",
      });
    },
  },
  async created() {
    // Recupera a página da URL se existir
    const page = parseInt(this.$route.query.page);
    if (page && !isNaN(page)) {
      this.currentPage = page;
    }
    await this.fetchAnuncios(this.currentPage);
  },
  watch: {
    // Atualiza ao mudar a query da página
    '$route.query.page'(newPage) {
      const page = parseInt(newPage);
      if (page && !isNaN(page) && page !== this.currentPage) {
        this.currentPage = page;
        this.fetchAnuncios(page);
      }
    }
  }
};
</script>

<style scoped>
.landing-page {
  padding-top: 100px;
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

.search-section {
  background: #fff;
  margin-bottom: 120px !important;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
  padding: 2.5rem 1.5rem 2rem 1.5rem;
  margin-top: 2rem;
}

.search-bar {
  max-width: 500px;
  width: 100%;
}

.input-group {
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  background: #f1f3f6;
}

.form-control {
  border: none;
  border-radius: 0;
  background: transparent;
  font-size: 1.15rem;
  padding: 1rem 1.25rem;
  outline: none;
  box-shadow: none;
}

.form-control:focus {
  background: #f8fafc;
  box-shadow: none;
}

.btn-primary {
  border-radius: 0 50px 50px 0;
  padding: 0 1.5rem;
  font-size: 1.25rem;
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  border: none;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover,
.btn-primary:focus {
  background: linear-gradient(90deg, #38f9d7 0%, #43e97b 100%);
}

.title {
  font-weight: 700;
  letter-spacing: -1px;
  color: #33A58C;
}
</style>