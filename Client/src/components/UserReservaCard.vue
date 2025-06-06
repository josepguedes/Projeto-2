<template>
  <div class="card reserva-card shadow mb-4 border-0">
    <div class="row g-0 align-items-stretch">
      <div class="col-md-4 d-flex align-items-center justify-content-center bg-light rounded-start">
        <img
          :src="reserva.ImagemAnuncio || 'https://via.placeholder.com/300'"
          :alt="reserva.Nome"
          class="img-fluid reserva-img"
        />
      </div>
      <div class="col-md-8">
        <div class="card-body d-flex flex-column h-100 position-relative">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title mb-0 fw-bold text-primary">{{ reserva.Nome }}</h5>
            <span :class="['badge', 'badge-status', getStatusClass(reserva.IdEstadoAnuncio)]">
              {{ getStatusText(reserva.IdEstadoAnuncio) }}
            </span>
            <!-- 3 dots menu -->
            <div class="dropdown ms-2" v-if="reserva.IdEstadoAnuncio === 2">
              <button
                class="btn btn-link btn-sm p-0 text-muted"
                type="button"
                @click="toggleMenu"
                aria-label="Mais opções"
              >
                <i class="bi bi-three-dots-vertical fs-4"></i>
              </button>
              <div
                v-if="showMenu"
                class="dropdown-menu dropdown-menu-end show"
                style="position: absolute; right: 0; top: 30px; min-width: 180px;"
              >
                <button class="dropdown-item text-danger" @click="handleCancelar">
                  <i class="bi bi-x-circle me-2"></i> Cancelar Reserva
                </button>
              </div>
            </div>
          </div>
          <div class="mb-2 text-muted small">
            <i class="bi bi-geo-alt me-1"></i>
            {{ reserva.LocalRecolha }}
          </div>
          <div class="row mb-2">
            <div class="col-6">
              <i class="bi bi-calendar-check me-1"></i>
              <span class="fw-semibold">Recolha:</span>
              <span>{{ formatDate(reserva.DataRecolha) }}</span>
            </div>
            <div class="col-6">
              <i class="bi bi-clock me-1"></i>
              <span class="fw-semibold">Horário:</span>
              <span>{{ formatTime(reserva.HorarioRecolha) }}</span>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-6">
              <i class="bi bi-currency-euro me-1"></i>
              <span class="fw-semibold">Preço:</span>
              <span>{{ formatPrice(reserva.Preco) }}</span>
            </div>
            <div class="col-6">
              <i class="bi bi-box me-1"></i>
              <span class="fw-semibold">Quantidade:</span>
              <span>{{ reserva.Quantidade }}</span>
            </div>
          </div>
          <div class="row mb-2 align-items-center">
            <div class="col-12 d-flex align-items-center gap-2">
              <i class="bi bi-person-circle me-1"></i>
              <span class="fw-semibold">Anunciante:</span>
              <span>{{ reserva.utilizador?.Nome || 'N/A' }}</span>
              <img v-if="reserva.utilizador?.ImagemPerfil" :src="reserva.utilizador.ImagemPerfil" alt="Perfil" class="rounded-circle ms-2" style="width:28px; height:28px; object-fit:cover;">
            </div>
          </div>
          <div class="mt-auto pt-2 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <div class="entrega-badge rounded-3 px-3 py-2 d-inline-flex align-items-center gap-2">
              <i class="bi bi-shield-lock-fill text-success"></i>
              <span class="fw-bold">Código de Entrega:</span>
              <span class="codigo">{{ reserva.CodigoVerificacao || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserReservaCard",
  props: {
    reserva: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showMenu: false,
    };
  },
  methods: {
    formatDate(date) {
      if (!date) return "Data não definida";
      return new Date(date).toLocaleDateString("pt-PT");
    },
    formatTime(time) {
      if (!time) return "Hora não definida";
      return time.substring(0, 5);
    },
    formatPrice(price) {
      if (!price) return "0,00€";
      return Number(price).toLocaleString("pt-PT", {
        style: "currency",
        currency: "EUR",
      });
    },
    getStatusText(status) {
      const texts = {
        1: "Disponível",
        2: "Reservado",
        3: "Expirado",
        4: "Cancelado",
        5: "Concluído",
      };
      return texts[status] || "Desconhecido";
    },
    getStatusClass(status) {
      switch (status) {
        case 1: return "bg-success";
        case 2: return "bg-warning text-dark";
        case 3: return "bg-secondary";
        case 4: return "bg-danger";
        case 5: return "bg-info text-dark";
        default: return "bg-light text-dark";
      }
    },
    toggleMenu(e) {
      this.showMenu = !this.showMenu;
      // Fecha o menu ao clicar fora
      if (this.showMenu) {
        document.addEventListener('click', this.handleClickOutside);
      }
    },
    handleClickOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.showMenu = false;
        document.removeEventListener('click', this.handleClickOutside);
      }
    },
    handleCancelar() {
      this.showMenu = false;
      this.$emit('cancelar', this.reserva);
    }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style scoped>
.reserva-card {
  border-radius: 1.25rem;
  overflow: hidden;
  transition: box-shadow 0.2s;
  background: #fff;
  max-width: 900px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem;
  position: relative;
}
.reserva-card:hover {
  box-shadow: 0 8px 32px rgba(44, 62, 80, 0.12), 0 1.5px 6px rgba(44, 62, 80, 0.08);
}
.reserva-img {
  max-width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 1rem 0 0 1rem;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
}
.badge-status {
  font-size: 0.95rem;
  padding: 0.5em 1em;
  box-shadow: 0 1px 4px rgba(44, 62, 80, 0.08);
}
.entrega-badge {
  background: #eafaf1;
  color: #27ae60;
  font-size: 1.05rem;
  font-family: 'Fira Mono', monospace, monospace;
  border: 1.5px dashed #27ae60;
  letter-spacing: 1px;
  box-shadow: 0 1px 4px rgba(44, 62, 80, 0.04);
}
.entrega-badge .codigo {
  color: #222;
  background: #fff;
  padding: 0.15em 0.5em;
  border-radius: 0.4em;
  font-size: 1.1em;
  font-family: inherit;
}
.dropdown-menu {
  z-index: 1000;
  min-width: 180px;
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.12);
  padding: 0.5rem 0;
}
.dropdown-item {
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 1.25rem;
  cursor: pointer;
}
.dropdown-item.text-danger:hover {
  background: #ffeaea;
  color: #dc3545;
}
@media (max-width: 900px) {
  .reserva-card {
    max-width: 98vw;
    padding: 0.5rem 1rem;
  }
}
@media (max-width: 768px) {
  .reserva-card {
    border-radius: 1rem;
  }
  .reserva-img {
    border-radius: 1rem 1rem 0 0;
    max-height: 140px;
  }
}
</style>