<template>
    <div class="modal fade" id="denunciaModal" tabindex="-1" aria-labelledby="denunciaModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="denunciaModalLabel">Denunciar {{ tipo }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Utilizador Denunciado</label>
                        <input type="text" class="form-control" :value="utilizadorDenunciado" disabled>
                    </div>
                    <div class="mb-3">
                        <label for="reportReason" class="form-label">Motivo da Denúncia</label>
                        <textarea class="form-control" id="reportReason" v-model="reportReason" rows="3"
                            placeholder="Descreva o motivo da denúncia"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger" @click="submitReport" :disabled="!reportReason">
                        Confirmar Denúncia
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap';
import { denunciasService } from '@/api/denuncia';

export default {
    name: 'DenunciaModal',
    emits: ['denuncia-enviada'],
    props: {
        idDenunciado: {
            type: Number,
            required: true
        },
        utilizadorDenunciado: {
            type: String,
            required: true
        },
        tipo: {
            type: String,
            default: 'Utilizador'
        }
    },
    data() {
        return {
            modal: null,
            reportReason: ''
        }
    },
    methods: {
        async submitReport() {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    alert('Por favor, faça login para denunciar');
                    return;
                }

                const payload = JSON.parse(atob(token.split('.')[1]));

                // Criar objeto de denúncia com todos os campos necessários
                const denunciaData = {
                    IdUtilizadorDenunciante: payload.IdUtilizador,
                    IdUtilizadorDenunciado: this.idDenunciado,
                    Motivo: this.reportReason,
                };

                await denunciasService.createDenuncia(denunciaData);

                this.modal.hide();
                this.reportReason = '';
                this.$emit('denuncia-enviada');
                alert('Denúncia enviada com sucesso!');
            } catch (error) {
                console.error('Erro ao denunciar:', error);
                alert('Erro ao enviar denúncia. Por favor, tente novamente.');
            }
        },
        showModal() {
            this.modal?.show();
        },
        hideModal() {
            this.modal?.hide();
        }
    },
    mounted() {
        this.modal = new Modal(document.getElementById('denunciaModal'));
    },
    beforeUnmount() {
        this.modal?.dispose();
    }
}
</script>