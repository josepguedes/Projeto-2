<template>
    <div class="modal fade" id="blockModal" tabindex="-1" aria-labelledby="blockModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="blockModalLabel">
                        {{ isBlocked ? 'Desbloquear' : 'Bloquear' }} Utilizador
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Utilizador: <strong>{{ user?.Nome }}</strong></p>
                    
                    <form @submit.prevent="handleSubmit" id="blockForm">
                        <div v-if="!isBlocked">
                            <div class="mb-3">
                                <label class="form-label">Tipo de Bloqueio:</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" v-model="blockType" 
                                        id="permanent" value="permanent">
                                    <label class="form-check-label" for="permanent">
                                        Permanente
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" v-model="blockType" 
                                        id="temporary" value="temporary">
                                    <label class="form-check-label" for="temporary">
                                        Temporário
                                    </label>
                                </div>
                            </div>

                            <div v-if="blockType === 'temporary'" class="mb-3">
                                <label class="form-label">Data de Término:</label>
                                <input 
                                    type="date" 
                                    class="form-control" 
                                    v-model="endDate" 
                                    :min="tomorrow"
                                    required
                                >
                            </div>
                        </div>
                        <div v-else>
                            <p class="text-danger">Tem certeza que deseja desbloquear este utilizador?</p>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-danger" form="blockForm">
                        {{ isBlocked ? 'Desbloquear' : 'Bloquear' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap';

export default {
    props: {
        user: {
            type: Object,
            default: () => ({})
        },
        isBlocked: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            blockType: 'permanent',
            endDate: '',
            modal: null
        };
    },
    methods: {
        showModal() {
            if (!this.modal) {
                this.modal = new Modal(this.$el);
            }
            this.blockType = 'permanent';
            this.endDate = '';
            this.modal.show();
        },
        hideModal() {
            if (this.modal) {
                this.modal.hide();
            }
        },
        handleSubmit() {
            if (this.blockType === 'temporary' && !this.endDate) {
                return; // The form won't submit due to HTML5 validation
            }
            
            this.$emit('submit', {
                blockType: this.blockType,
                endDate: this.blockType === 'temporary' ? this.endDate : null
            });
        }
    },
    computed: {
        tomorrow() {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        }
    },
    mounted() {
        this.modal = new Modal(this.$el);
    },
    beforeUnmount() {
        if (this.modal) {
            this.modal.dispose();
        }
    }
};
</script>