<template>
  <div class="modal" :class="{ 'd-block': show }" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Avaliar Vendedor</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <form @submit.prevent="submitEvaluation">
          <div class="modal-body">
            <div v-if="success" class="alert alert-success">
              Avaliação enviada com sucesso!
            </div>
            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>
            <div class="mb-3">
              <label class="form-label">Classificação</label>
              <div class="star-rating">
                <i
                  v-for="i in 5"
                  :key="i"
                  :class="['bi', i <= form.Classificacao ? 'bi-star-fill text-warning' : 'bi-star text-muted', 'fs-3', 'pointer']"
                  @click="form.Classificacao = i"
                ></i>
              </div>
            </div>
            <div class="mb-3">
              <label for="comentario" class="form-label">Comentário</label>
              <textarea
                id="comentario"
                class="form-control"
                v-model="form.Comentario"
                rows="3"
                required
                maxlength="300"
                placeholder="Escreva um comentário sobre o vendedor"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="loading || !form.Classificacao || !form.Comentario">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Enviar Avaliação
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { avaliacoesService } from '@/api/avaliacoes';

export default {
  name: 'EvaluationModal',
  props: {
    show: { type: Boolean, default: false },
    anuncioId: { type: Number, required: true },
    vendedorId: { type: Number, required: true }
  },
  data() {
    return {
      form: {
        Classificacao: 0,
        Comentario: ''
      },
      loading: false,
      error: null,
      success: false
    };
  },
  methods: {
    async submitEvaluation() {
      this.loading = true;
      this.error = null;
      try {
        const token = sessionStorage.getItem('token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        await avaliacoesService.createAvaliacao({
          IdAnuncio: this.anuncioId,
          IdAutor: payload.IdUtilizador,
          IdAvaliado: this.vendedorId,
          Comentario: this.form.Comentario,
          Classificacao: this.form.Classificacao
        });
        this.success = true;
        this.$emit('evaluated');
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    show(val) {
      if (!val) {
        this.form.Classificacao = 0;
        this.form.Comentario = '';
        this.error = null;
        this.success = false;
      }
    }
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
.star-rating .bi {
  cursor: pointer;
  transition: color 0.2s;
}
</style>