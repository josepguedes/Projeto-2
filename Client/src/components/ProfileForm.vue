<template>
    <div class="card border-0 shadow-sm profile-card">
        <div class="card-body">
            <!-- Imagem de Perfil -->
            <div class="profile-image-container mb-4">
                <img :src="imagePreview || formData.ImagemPerfil || 'https://via.placeholder.com/150'"
                    alt="Imagem de Perfil" class="profile-image" />
                <label class="image-upload-overlay" for="imagemPerfilInput" title="Alterar imagem de perfil">
                    <i class="bi bi-camera"></i>
                </label>
                <input id="imagemPerfilInput" type="file" accept="image/*" @change="handleImageUpload"
                    style="display: none" />
            </div>

            <!-- Dados do Perfil -->
            <form @submit.prevent="handleSubmit">
                <h5 class="mb-3">Dados do Perfil</h5>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Nome</label>
                        <input type="text" class="form-control" v-model="formData.Nome" required />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" v-model="formData.Email" required />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-control" v-model="formData.Password"
                            placeholder="Nova password" />
                    </div>
                </div>
                <div class="col-12 mt-3">
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        Guardar Dados
                    </button>
                </div>
                <div v-if="message"
                    :class="['alert', message.type === 'success' ? 'alert-success' : 'alert-danger', 'mt-3']">
                    {{ message.text }}
                </div>
            </form>

            <!-- Secção OPCIONAL -->
            <div class="mt-5 mb-3">
                <h5 class="text-secondary">Informações Opcionais</h5>
                <hr />
            </div>
            <form @submit.prevent="handleExtraSubmit">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">NIF</label>
                        <input type="number" class="form-control" v-model="extraForm.Nif" placeholder="NIF"
                            min="100000000" max="999999999" />
                        <small class="form-text text-muted">
                            O NIF deve ter 9 dígitos e começar por 1, 2, 3, 5, 6, 8 ou 9.
                        </small>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Data de Nascimento</label>
                        <input type="date" class="form-control" v-model="extraForm.DataNascimento"
                            placeholder="Data de Nascimento" />
                    </div>
                </div>
                <div class="col-12 mt-3">
                    <button type="submit" class="btn btn-outline-primary" :disabled="extraLoading">
                        <span v-if="extraLoading" class="spinner-border spinner-border-sm me-2"></span>
                        Guardar Informações
                    </button>
                </div>
                <div v-if="extraMessage"
                    :class="['alert', extraMessage.type === 'success' ? 'alert-success' : 'alert-danger', 'mt-3']">
                    {{ extraMessage.text }}
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { utilizadorService } from '@/api/utilizador';

export default {
    data() {
        return {
            formData: {
                Nome: '',
                Email: '',
                Password: '',
                ImagemPerfil: null
            },
            extraForm: {
                Nif: '',
                DataNascimento: '',
                Telefone: '',
                Morada: ''
            },
            imagePreview: null,
            imageFile: null,
            loading: false,
            extraLoading: false,
            message: null,
            extraMessage: null
        };
    },
    async created() {
        try {
            const token = sessionStorage.getItem('token');
            const payload = JSON.parse(atob(token.split('.')[1]));
            const user = await utilizadorService.getUserDetails(payload.IdUtilizador);

            this.formData.Nome = user.Nome;
            this.formData.Email = user.Email;
            this.formData.ImagemPerfil = user.ImagemPerfil || '';
            this.extraForm.Nif = user.Nif || '';
            this.extraForm.DataNascimento = user.DataNascimento ? user.DataNascimento.substring(0, 10) : '';
        } catch (error) {
            this.message = { type: 'error', text: 'Erro ao carregar dados do utilizador.' };
        }
    },
    methods: {
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.imageFile = file;
                const reader = new FileReader();
                reader.onload = e => {
                    this.imagePreview = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },
        async handleSubmit() {
            this.loading = true;
            this.message = null;
            try {
                const token = sessionStorage.getItem('token');
                const payload = JSON.parse(atob(token.split('.')[1]));
                const formData = new FormData();
                formData.append('Nome', this.formData.Nome);
                formData.append('Email', this.formData.Email);
                if (this.formData.Password) formData.append('Password', this.formData.Password);
                if (this.imageFile) formData.append('ImagemPerfil', this.imageFile);

                await utilizadorService.updateUser(payload.IdUtilizador, formData, true);
                this.message = { type: 'success', text: 'Dados atualizados com sucesso!' };
                // Atualizar imagem de perfil após upload
                if (this.imagePreview) {
                    this.formData.ImagemPerfil = this.imagePreview;
                }

                this.$emit('profile-updated');
                window.dispatchEvent(new CustomEvent('profile-updated'));

            } catch (error) {
                this.message = { type: 'error', text: 'Erro ao atualizar dados.' };
            } finally {
                this.loading = false;
            }
        },
        async handleExtraSubmit() {
            this.extraLoading = true;
            this.extraMessage = null;
            try {
                const token = sessionStorage.getItem('token');
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (this.extraForm.Nif && !/^[1235689]\d{8}$/.test(this.extraForm.Nif)) {
                    this.extraMessage = { type: 'error', text: 'NIF inválido. Deve ter 9 dígitos e começar por 1, 2, 3, 5, 6, 8 ou 9.' };
                    return;
                }
                await utilizadorService.updateUser(payload.IdUtilizador, {
                    Nif: this.extraForm.Nif || null,
                    DataNascimento: this.extraForm.DataNascimento || null,
                    Telefone: this.extraForm.Telefone || null,
                    Morada: this.extraForm.Morada || null
                });
                this.extraMessage = { type: 'success', text: 'Informações opcionais atualizadas!' };
            } catch (error) {
                this.extraMessage = { type: 'error', text: 'Erro ao atualizar informações opcionais.' };
            } finally {
                this.extraLoading = false;
            }
        }
    }
};
</script>

<style scoped>
.profile-card {
    max-width: 700px;
    border-radius: 1.25rem;
    background: #fff;
    box-shadow: 0 4px 24px rgba(44, 62, 80, 0.08);
    padding: 2rem 1.5rem;
}

.profile-image-container {
    position: relative;
    width: 150px;
    height: 150px;
    margin: 0 auto 1.5rem auto;
    display: flex;
    align-items: center;
    justify-content: center;
}

.profile-image {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border: 3px solid #33A58C;
    box-shadow: 0 2px 8px rgba(44, 62, 80, 0.10);
    border-radius: 50%;
    background: #f8f9fa;
    transition: box-shadow 0.2s;
}

.image-upload-overlay {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: #33A58C;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(44, 62, 80, 0.10);
    transition: background 0.2s;
}

.image-upload-overlay:hover {
    background: #28997b;
}

.image-upload-overlay i {
    color: #fff;
    font-size: 1.3rem;
}

.form-label {
    font-weight: 500;
    color: #495057;
    margin-bottom: 0.3rem;
}

.form-control {
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid #e9ecef;
    background: #f8f9fa;
    transition: border-color 0.2s;
}

.form-control:focus {
    border-color: #33A58C;
    background: #fff;
    box-shadow: 0 0 0 0.2rem rgba(51, 165, 140, 0.08);
}

.btn-primary,
.btn-outline-primary {
    padding: 0.6rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 1rem;
}

.btn-primary {
    background: #33A58C;
    border: none;
}

.btn-primary:hover {
    background: #28997b;
}

.btn-outline-primary {
    border: 2px solid #33A58C;
    color: #33A58C;
    background: #fff;
}

.btn-outline-primary:hover {
    background: #33A58C;
    color: #fff;
}

.alert {
    border-radius: 0.5rem;
    font-size: 1rem;
}

@media (max-width: 768px) {
    .profile-card {
        padding: 1rem 0.5rem;
    }

    .profile-image-container {
        width: 110px;
        height: 110px;
    }

    .profile-image {
        width: 110px;
        height: 110px;
    }
}
</style>