<template>
  <div class="landing-page">
    <div class="container">
      <!-- Search Section -->
      <div class="search-section text-center mb-5">
        <h1 class="display-4 mb-4 title">Encontre Produtos Próximos</h1>
        <div class="search-bar mx-auto">
          <div class="input-group">
            <input type="text" class="form-control" v-model.trim="searchTerm" @keyup.enter="handleSearch"
              placeholder="Pesquisar produtos..." autocomplete="off" />
            <button class="btn btn-primary" @click="handleSearch" :disabled="loading">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section mb-4">
        <div class="row justify-content-center align-items-end g-3">
          <div class="col-md-3">
            <label for="filterCategoria" class="form-label mb-1">Categoria</label>
            <select id="filterCategoria" v-model="filterCategoria" class="form-select" :disabled="loading">
              <option value="" disabled>Selecione uma categoria</option>
              <option value="todas">Todas</option>
              <option v-for="cat in categorias" :key="cat.IdProdutoCategoria" :value="cat.IdProdutoCategoria">
                {{ cat.NomeCategoria }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="filterPreco" class="form-label mb-1">Preço Máximo (€)</label>
            <input id="filterPreco" type="number" min="0" v-model.number="filterPreco" class="form-control"
              placeholder="Ex: 10" :disabled="loading" />
          </div>
          <div class="col-md-3">
            <label for="filterData" class="form-label mb-1">Data de Recolha</label>
            <input id="filterData" type="date" v-model="filterData" class="form-control" :disabled="loading" />
          </div>
          <div class="col-md-2 d-grid">
            <button class="btn btn-outline-primary filter" @click="aplicarFiltros" :disabled="loading">
              Filtrar
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
      <div v-else>
        <div v-if="anuncios.length === 0" class="text-center text-muted py-5">
          <i class="bi bi-inbox fs-3 d-block mb-2"></i>
          <span>
            {{ mensagemSemResultados }}
          </span>
        </div>
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
      </div>

      <!-- Pagination -->
      <nav v-if="totalPages > 1" class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1 || loading">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
            <button class="page-link" @click="goToPage(page)" :disabled="loading">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages || loading">
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
import { produtoCategoriaService } from "@/api/produtoCategoria";
import FoodCard from "@/components/FoodCard.vue";

export default {
  name: "LandingPage",
  components: { FoodCard },
  data() {
    return {
      searchTerm: "",
      filterCategoria: "",
      filterPreco: null,
      filterData: "",
      anuncios: [],
      categorias: [],
      loading: true,
      error: null,
      links: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 12,
      _lastFetch: null
    };
  },
  methods: {
    async fetchCategorias() {
      try {
        const response = await produtoCategoriaService.getAllCategorias(1, 100);
        this.categorias = Array.isArray(response?.data) ? response.data : [];
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        this.categorias = [];
      }
    },
    async fetchAnuncios(page = 1) {
      try {
        this.loading = true;
        this.error = null;

        // Memoization para evitar requisições desnecessárias
        if (
          this._lastFetch &&
          this._lastFetch.page === page &&
          this._lastFetch.searchTerm === this.searchTerm &&
          this._lastFetch.filterCategoria === this.filterCategoria &&
          this._lastFetch.filterPreco === this.filterPreco &&
          this._lastFetch.filterData === this.filterData
        ) {
          this.loading = false;
          return;
        }

        const filters = {};
        if (this.searchTerm) filters.nome = this.searchTerm;
        if (this.filterCategoria && this.filterCategoria !== 'todas') filters.categoria = this.filterCategoria;
        if (this.filterPreco) filters.precoMax = this.filterPreco;
        if (this.filterData) filters.dataRecolha = this.filterData;

        const response = await anunciosService.getAllAnuncios(
          page,
          this.itemsPerPage,
          filters
        );

        this.anuncios = response.data;
        this.links = response.links;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;

        // Salva o último fetch para memoization
        this._lastFetch = {
          page,
          searchTerm: this.searchTerm,
          filterCategoria: this.filterCategoria,
          filterPreco: this.filterPreco,
          filterData: this.filterData
        };

        // Atualiza a query da URL
        if (String(this.$route.query.page) !== String(this.currentPage)) {
          this.$router.push({
            query: {
              ...this.$route.query,
              page: this.currentPage
            }
          });
        }
      } catch (err) {
        this.error = "Erro ao carregar os anúncios. Por favor, tente novamente.";
        console.error("Erro em fetchAnuncios:", err);
      } finally {
        this.loading = false;
      }
    },
    aplicarFiltros() {
      this.currentPage = 1;
      this.fetchAnuncios(this.currentPage);
      this.updateRouteQueryComFiltros();
    },
    updateRouteQueryComFiltros() {
      const query = { ...this.$route.query, page: String(this.currentPage) };
      if (this.searchTerm) query.nome = this.searchTerm; else delete query.nome;
      if (this.filterCategoria && this.filterCategoria !== 'todas') {
        const cat = this.categorias.find(c => c.IdProdutoCategoria == this.filterCategoria);
        query.categoria = cat ? cat.NomeCategoria : '';
      } else if (this.filterCategoria === 'todas') {
        query.categoria = 'todas';
      } else {
        delete query.categoria;
      }
      if (this.filterPreco) query.precoMax = String(this.filterPreco); else delete query.precoMax;
      if (this.filterData) query.dataRecolha = this.filterData; else delete query.dataRecolha;

      if (JSON.stringify(query) !== JSON.stringify(this.$route.query)) {
        this.$router.push({ query }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error(err);
        });
      }
    },
    goToPage(page) {
      if (page < 1 || page > this.totalPages) return;
      if (page === this.currentPage) return;
      this.fetchAnuncios(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    async handleSearch() {
      if (this.loading) return;
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
      if (Number(price) === 0) return 'Grátis';
      return Number(price).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'EUR'
      });
    },
  },
  async created() {
    await this.fetchCategorias();

    // Recuperar filtros da URL
    this.searchTerm = this.$route.query.nome || "";
    this.filterCategoria = this.$route.query.categoria || "";
    this.filterPreco = this.$route.query.precoMax ? parseFloat(this.$route.query.precoMax) : null;
    this.filterData = this.$route.query.dataRecolha || "";

    const pageFromQuery = parseInt(this.$route.query.page) || 1;
    this.currentPage = pageFromQuery;

    if (!this.$route.query.page) {
      this.$router.replace({ query: { ...this.$route.query, page: 1 } });
    }

    await this.fetchAnuncios(this.currentPage);
  },
  computed: {
    mensagemSemResultados() {
      if (this.searchTerm) {
        return 'Nenhum alimento encontrado para a pesquisa "' + this.searchTerm + '".';
      }
      if (this.filterCategoria && this.filterCategoria !== 'todas') {
        const cat = this.categorias.find(c => c.IdProdutoCategoria == this.filterCategoria);
        return cat
          ? `Nenhum alimento encontrado para a categoria "${cat.NomeCategoria}".`
          : 'Nenhum alimento encontrado para a categoria selecionada.';
      }
      if (this.filterPreco) {
        return 'Nenhum alimento encontrado com o preço máximo selecionado.';
      }
      if (this.filterData) {
        return 'Nenhum alimento encontrado para a data de recolha selecionada.';
      }
      return 'Nenhum alimento encontrado.';
    }
  },
  watch: {
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

.filter-section {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(51, 165, 140, 0.07);
  padding: 1.5rem 2rem 1.5rem 2rem;
  margin-bottom: 2rem;
  margin-top: -80px;
  position: relative;
  z-index: 2;
}

.filter {
  width: 100%;
  height: 50px;
}

.filter-section .form-label {
  font-weight: 600;
  color: #33A58C;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.filter-section .form-select,
.filter-section .form-control {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #f8fafc;
  font-size: 1rem;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s;
}

.filter-section .form-select:focus,
.filter-section .form-control:focus {
  border-color: #33A58C;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(51, 165, 140, 0.15);
}

.filter-section .btn-outline-primary {
  border-radius: 8px;
  font-weight: 600;
  color: #33A58C;
  border-color: #33A58C;
  transition: background 0.2s, color 0.2s;
}

@media (max-width: 768px) {
  .filter-section {
    padding: 1rem;
    margin-top: 0;
  }
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
  border: none;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-weight: 700;
  letter-spacing: -1px;
  color: #33A58C;
}
</style>