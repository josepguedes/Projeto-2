<template>
    <div class="card border-0 shadow-sm">
        <div class="card-body">
            <h4 class="mb-4">Editar Perfil</h4>

            <!-- Profile Image Section -->
            <div class="text-center mb-4">
                <div class="profile-image-container">
                    <img :src="imagePreview || formData.ImagemPerfil || 'https://via.placeholder.com/150'" 
                         alt="Profile" 
                         class="rounded-circle profile-image">
                    <div class="image-upload-overlay">
                        <label for="imageUpload" class="mb-0">
                            <i class="bi bi-camera"></i>
                        </label>
                        <input type="file" 
                               id="imageUpload" 
                               accept="image/*" 
                               @change="handleImageChange" 
                               class="d-none">
                    </div>
                </div>
            </div>

            <form @submit.prevent="handleSubmit">
                <div class="row g-3">
                    <div class="col-12">
                        <div class="form-group">
                            <label>Nome Completo</label>
                            <input type="text" 
                                   class="form-control" 
                                   v-model="formData.Nome" 
                                   required>
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" 
                                   class="form-control" 
                                   v-model="formData.Email" 
                                   required>
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="form-group">
                            <label>Nova Senha</label>
                            <input type="password" 
                                   class="form-control" 
                                   v-model="formData.Password" 
                                   placeholder="********">
                        </div>
                    </div>

                    <div class="col-12">
                        <button type="submit" 
                                class="btn btn-primary"
                                :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </form>

            <div v-if="message" :class="['alert', message.type === 'success' ? 'alert-success' : 'alert-danger', 'mt-3']">
                {{ message.text }}
            </div>
        </div>
    </div>
</template>

<script>
import { utilizadorService } from '@/api/utilizador';

export default {
    name: 'ProfileForm',
    props: {
        userDetails: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            loading: false,
            message: null,
            imagePreview: null,
            formData: {
                Nome: '',
                Email: '',
                Password: '',
                ImagemPerfil: ''
            }
        }
    },
    watch: {
        userDetails: {
            immediate: true,
            handler(newValue) {
                if (newValue) {
                    this.formData.Nome = newValue.Nome;
                    this.formData.Email = newValue.Email;
                    this.formData.ImagemPerfil = newValue.ImagemPerfil;
                }
            }
        }
    },
    methods: {
        handleImageChange(event) {
            const file = event.target.files[0];
            if (!file) return;

            this.imagePreview = URL.createObjectURL(file);
            this.formData.ImagemPerfil = this.imagePreview;
        },
        async handleSubmit() {
            try {
                this.loading = true;
                this.message = null;

                const token = sessionStorage.getItem('token');
                const payload = JSON.parse(atob(token.split('.')[1]));

                await utilizadorService.updateUser(payload.IdUtilizador, this.formData);

                this.message = {
                    type: 'success',
                    text: 'Perfil atualizado com sucesso!'
                };

                this.$emit('profile-updated');
            } catch (error) {
                console.error('Error updating profile:', error);
                this.message = {
                    type: 'error',
                    text: 'Erro ao atualizar perfil'
                };
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style scoped>
.form-group {
    margin-bottom: 1.5rem;
}

.form-control {
    padding: 0.75rem;
    border-radius: 0.5rem;
}

.btn-primary {
    padding: 0.75rem 1.5rem;
}

.card {
    border-radius: 1rem;
}

.profile-image-container {
    position: relative;
    width: 150px;
    height: 150px;
    margin: 0 auto;
}

.profile-image {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border: 3px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 50%;
}

.image-upload-overlay {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #33A58C;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 2px solid #fff;
}

.image-upload-overlay i {
    color: white;
}
</style>