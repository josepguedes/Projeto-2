<template>
    <div class="modal" tabindex="-1" style="display: block; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Criar Novo Anúncio</h5>
                    <button type="button" class="btn-close" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleSubmit">
                        <!-- Basic Info -->
                        <div class="row g-3">
                            <div class="col-12">
                                <label for="nome" class="form-label">Nome do Produto</label>
                                <input type="text" class="form-control" id="nome" v-model="formData.Nome" required>
                            </div>

                            <div class="col-12">
                                <label for="descricao" class="form-label">Descrição</label>
                                <textarea class="form-control" id="descricao" rows="3"
                                    v-model="formData.Descricao"></textarea>
                            </div>
                        </div>

                        <!-- Price and Quantity -->
                        <div class="row g-3 mt-2">
                            <div class="col-md-6">
                                <label for="preco" class="form-label">Preço (€)</label>
                                <input type="number" class="form-control" id="preco" v-model="formData.Preco"
                                    step="0.01" min="0" required>
                            </div>
                            <div class="col-md-6">
                                <label for="quantidade" class="form-label">Quantidade</label>
                                <input type="number" class="form-control" id="quantidade" v-model="formData.Quantidade"
                                    min="1" required>
                            </div>
                        </div>

                        <!-- Location and Time -->
                        <div class="row g-3 mt-2">
                            <div class="col-md-6">
                                <label for="localRecolha" class="form-label">Local de Recolha</label>
                                <input type="text" class="form-control" id="localRecolha"
                                    v-model="formData.LocalRecolha" required>
                            </div>
                            <div class="col-md-6">
                                <label for="horarioRecolha" class="form-label">Horário de Recolha</label>
                                <input type="time" class="form-control" id="horarioRecolha"
                                    v-model="formData.HorarioRecolha" required>
                            </div>
                        </div>

                        <!-- Dates -->
                        <div class="row g-3 mt-2">
                            <div class="col-md-6">
                                <label for="dataRecolha" class="form-label">Data de Recolha</label>
                                <input type="date" class="form-control" id="dataRecolha" v-model="formData.DataRecolha"
                                    required>
                            </div>
                            <div class="col-md-6">
                                <label for="dataValidade" class="form-label">Data de Validade</label>
                                <input type="date" class="form-control" id="dataValidade"
                                    v-model="formData.DataValidade" required>
                            </div>
                        </div>

                        <!-- Category and Image -->
                        <div class="row g-3 mt-2">
                            <div class="col-md-6">
                                <label for="categoria" class="form-label">Categoria</label>
                                <select class="form-select" id="categoria" v-model="formData.IdProdutoCategoria"
                                    required>
                                    <option value="">Selecione uma categoria</option>
                                    <option v-for="categoria in categorias" :key="categoria.IdProdutoCategoria"
                                        :value="categoria.IdProdutoCategoria">
                                        {{ categoria.NomeCategoria }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="imagem" class="form-label">Imagem do Produto</label>
                                <input type="file" class="form-control" id="imagem" @change="handleImageUpload"
                                    accept="image/*">
                            </div>
                        </div>

                        <!-- Buttons -->
                        <div class="d-flex gap-2 mt-4">
                            <button type="submit" class="btn btn-primary">Criar Anúncio</button>
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
import { produtoCategoriaService } from '@/api/produtoCategoria';

export default {
    name: 'CreateAnuncio',
    data() {
        return {
            formData: {
                Nome: '',
                Descricao: '',
                LocalRecolha: '',
                HorarioRecolha: '',
                Preco: '',
                DataRecolha: '',
                DataValidade: '',
                Quantidade: 1,
                IdProdutoCategoria: '',
                ImagemAnuncio: null,
                IdUtilizadorAnuncio: null
            },
            categorias: []
        }
    },
    methods: {
        async fetchCategorias() {
            try {
                const response = await produtoCategoriaService.getAllCategorias();
                this.categorias = response.data;
            } catch (error) {
                console.error('Erro ao buscar categorias:', error);
            }
        },
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.formData.ImagemAnuncio = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },
        // In CreateAnuncio.vue, update the handleSubmit method
        // In your CreateAnuncio component
        async handleSubmit() {
            try {
                this.isSubmitting = true;
                this.error = null;

                // Log the form data
                console.log('Form data:', this.formData);

                await anunciosService.createAnuncio(this.formData);
                this.$emit('created');
                this.$emit('close');
            } catch (error) {
                console.error('Erro ao criar anúncio:', error);
                this.error = error.message || 'Erro ao criar anúncio. Por favor, tente novamente.';
            } finally {
                this.isSubmitting = false;
            }
        }
    },
    created() {
        this.fetchCategorias();
    }
}
</script>

<style scoped>
.modal {
    position: fixed;
    inset: 0;
    z-index: 1050;
    overflow-y: auto;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-dialog {
    margin: 1.75rem auto;
    max-height: calc(100vh - 3.5rem);
}

.modal-body {
    max-height: calc(100vh - 12rem);
    overflow-y: auto;
}

.form-label {
    font-weight: 500;
    color: #495057;
    margin-bottom: 0.3rem;
}

.form-control,
.form-select {
    padding: 0.5rem 0.75rem;
}

.row+.row {
    margin-top: 0.5rem;
}
</style>