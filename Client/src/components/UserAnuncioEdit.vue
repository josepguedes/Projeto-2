<template>
    <div class="modal" :class="{ 'd-block': show }" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Editar Anúncio</h5>
                    <button type="button" class="btn-close" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleSubmit">
                        <!-- Nome -->
                        <div class="mb-3">
                            <label for="nome" class="form-label">Nome do Produto</label>
                            <input type="text" class="form-control" id="nome" v-model="formData.Nome" required>
                        </div>
                        <!-- Descrição -->
                        <div class="mb-3">
                            <label for="descricao" class="form-label">Descrição</label>
                            <textarea class="form-control" id="descricao" rows="3" v-model="formData.Descricao"></textarea>
                        </div>
                        <!-- Preço e Quantidade -->
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label for="preco" class="form-label">Preço (€)</label>
                                <input type="number" class="form-control" id="preco" v-model="formData.Preco" step="0.01" min="0" required>
                            </div>
                            <div class="col-md-6">
                                <label for="quantidade" class="form-label">Quantidade</label>
                                <input type="number" class="form-control" id="quantidade" v-model="formData.Quantidade" min="1" required>
                            </div>
                        </div>
                        <!-- Local e Horário -->
                        <div class="row g-3 mt-2">
                            <div class="col-md-6">
                                <label for="localRecolha" class="form-label">Local de Recolha</label>
                                <input type="text" class="form-control" id="localRecolha" v-model="formData.LocalRecolha" required>
                            </div>
                            <div class="col-md-6">
                                <label for="horarioRecolha" class="form-label">Horário de Recolha</label>
                                <input type="time" class="form-control" id="horarioRecolha" v-model="formData.HorarioRecolha" required>
                            </div>
                        </div>
                        <!-- Datas -->
                        <div class="row g-3 mt-2">
                            <div class="col-md-6">
                                <label for="dataRecolha" class="form-label">Data de Recolha</label>
                                <input type="date" class="form-control" id="dataRecolha" v-model="formData.DataRecolha" required>
                            </div>
                            <div class="col-md-6">
                                <label for="dataValidade" class="form-label">Data de Validade</label>
                                <input type="date" class="form-control" id="dataValidade" v-model="formData.DataValidade" required>
                            </div>
                        </div>
                        <!-- Categoria e Imagem -->
                        <div class="row g-3 mt-2">
                            <div class="col-md-6">
                                <label for="categoria" class="form-label">Categoria</label>
                                <select class="form-select" id="categoria" v-model="formData.IdProdutoCategoria" required>
                                    <option value="">Selecione uma categoria</option>
                                    <option v-for="categoria in categorias" :key="categoria.IdProdutoCategoria" :value="categoria.IdProdutoCategoria">
                                        {{ categoria.NomeCategoria }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="imagem" class="form-label">Imagem do Produto</label>
                                <input type="file" class="form-control" id="imagem" @change="handleImageUpload" accept="image/*">
                                <div v-if="imagePreview" class="mt-2">
                                    <img :src="imagePreview" alt="Pré-visualização" class="img-thumbnail" style="max-height: 180px;">
                                </div>
                                <div v-else-if="formData.ImagemAnuncio && typeof formData.ImagemAnuncio === 'string'" class="mt-2">
                                    <img :src="formData.ImagemAnuncio" alt="Imagem atual" class="img-thumbnail" style="max-height: 180px;">
                                </div>
                            </div>
                        </div>
                        <!-- Erro -->
                        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
                        <!-- Botões -->
                        <div class="d-flex gap-2 mt-4">
                            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">Salvar Alterações</button>
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
    name: 'UserAnuncioEdit',
    props: {
        anuncio: {
            type: Object,
            required: true
        },
        show: {
            type: Boolean,
            default: false
        }
    },
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
                ImagemAnuncio: null // pode ser string (url) ou File
            },
            categorias: [],
            imagePreview: null,
            isSubmitting: false,
            error: null
        }
    },
    watch: {
        anuncio: {
            immediate: true,
            handler(anuncio) {
                if (anuncio) {
                    this.formData = {
                        Nome: anuncio.Nome || '',
                        Descricao: anuncio.Descricao || '',
                        LocalRecolha: anuncio.LocalRecolha || '',
                        HorarioRecolha: anuncio.HorarioRecolha || '',
                        Preco: anuncio.Preco || '',
                        DataRecolha: anuncio.DataRecolha ? anuncio.DataRecolha.substring(0, 10) : '',
                        DataValidade: anuncio.DataValidade ? anuncio.DataValidade.substring(0, 10) : '',
                        Quantidade: anuncio.Quantidade || 1,
                        IdProdutoCategoria: anuncio.IdProdutoCategoria || '',
                        ImagemAnuncio: anuncio.ImagemAnuncio || null
                    };
                    this.imagePreview = null;
                }
            }
        }
    },
    methods: {
        async fetchCategorias() {
            try {
                const response = await produtoCategoriaService.getAllCategorias();
                this.categorias = response.data;
            } catch (error) {
                this.error = 'Erro ao buscar categorias';
            }
        },
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.formData.ImagemAnuncio = file;
                const reader = new FileReader();
                reader.onload = e => {
                    this.imagePreview = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },
        async handleSubmit() {
            try {
                this.isSubmitting = true;
                this.error = null;
                // Monta FormData para envio de imagem
                const formData = new FormData();
                for (const key in this.formData) {
                    if (key === 'ImagemAnuncio' && this.formData.ImagemAnuncio instanceof File) {
                        formData.append('ImagemAnuncio', this.formData.ImagemAnuncio);
                    } else {
                        formData.append(key, this.formData[key]);
                    }
                }
                // PUT para /anuncios/:id
                const token = sessionStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/anuncios/${this.anuncio.IdAnuncio}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`
                        // Não definir Content-Type, o browser define para FormData
                    },
                    body: formData
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || 'Erro ao atualizar anúncio');
                }
                this.$emit('updated');
                this.$emit('close');
            } catch (error) {
                this.error = error.message || 'Erro ao atualizar anúncio';
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
    background-color: rgba(0, 0, 0, 0.5);
}
.img-thumbnail {
    max-width: 100%;
    border-radius: 0.5rem;
    object-fit: cover;
}
</style>