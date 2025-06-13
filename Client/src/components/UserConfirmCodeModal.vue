<template>
  <div class="modal" :class="{ 'd-block': show }" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirmar Código de Entrega</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div v-if="success">
            <div class="alert alert-success">
              Código confirmado com sucesso! O anúncio foi concluído.
            </div>
          </div>
          <form v-else @submit.prevent="submitCode">
            <div class="mb-3">
              <label for="code" class="form-label">Insira o código fornecido pelo comprador:</label>
              <input type="text" class="form-control" id="code" v-model="code" required maxlength="6" />
            </div>
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary">Confirmar</button>
              <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { anunciosService } from '@/api/anuncio';

export default {
  name: 'UserConfirmCodeModal',
  props: {
    anuncioId: { type: Number, required: true },
    show: { type: Boolean, default: false }
  },
  data() {
    return {
      code: '',
      error: null,
      success: false,
    };
  },
  methods: {
    async submitCode() {
      this.error = null;
      try {
        await anunciosService.confirmarCodigoEntrega(this.anuncioId, this.code);
        this.success = true;
        this.showEvaluation = true;
        this.$emit('confirmed'); // For parent to refresh list or show buyer message
      } catch (err) {
        this.error = err.message || 'Código incorreto';
      }
    },
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>