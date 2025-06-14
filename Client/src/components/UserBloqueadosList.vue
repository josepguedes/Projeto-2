<template>
    <div class="user-bloqueados-list">
        <!-- Empty State -->
        <div v-if="!bloqueios || bloqueios.length === 0" class="d-flex flex-column align-items-center justify-content-center py-5 text-secondary">
            <i class="bi bi-slash-circle display-4 mb-3"></i>
            <span class="fs-5">Nenhum utilizador bloqueado encontrado.</span>
            <small class="mt-1">Os utilizadores bloqueados aparecerão aqui.</small>
        </div>

        <!-- Table with blocked users -->
        <table v-else class="table table-hover align-middle m-0">
            <thead class="table-light">
                <tr>
                    <th class="ps-4">Utilizador</th>
                    <th>Data de Bloqueio</th>
                    <th class="text-end pe-4">Ações</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="bloqueio in bloqueios" :key="bloqueio.IdUtilizadoresBloqueados">
                    <td class="ps-4">
                        <div class="d-flex align-items-center gap-2">
                            <img :src="bloqueio.bloqueado.ImagemPerfil" alt="Utilizador" class="rounded-circle"
                                width="32" height="32" />
                            <div class="fw-medium mb-0">{{ bloqueio.bloqueado.Nome }}</div>
                        </div>
                    </td>
                    <td>{{ formatDate(bloqueio.DataBloqueio) }}</td>
                    <td class="text-end pe-4">
                        <div class="btn-group">
                            <button @click="handleReport(bloqueio)" class="btn btn-sm btn-outline-danger me-2">
                                <i class="bi bi-flag me-1"></i>
                                Denunciar
                            </button>
                            <button @click="$emit('desbloquear', bloqueio.IdUtilizadoresBloqueados)"
                                class="btn btn-sm btn-outline-danger">
                                <i class="bi bi-unlock me-1"></i>
                                Desbloquear
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <DenunciaModal v-if="selectedUser" ref="denunciaModal" :idDenunciado="selectedUser.IdUtilizador"
            :utilizadorDenunciado="selectedUser.Nome" tipo="Utilizador" @denuncia-enviada="handleDenunciaEnviada" />
    </div>

</template>

<script>
import DenunciaModal from './DenunciaModal.vue';
import { Modal } from 'bootstrap';

export default {
    name: 'UserBloqueadosList',
    components: {
        DenunciaModal
    },
    props: {
        bloqueios: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            selectedUser: null,
            denunciaModal: null
        }
    },
    methods: {
        formatDate(date) {
            if (!date) return 'Data não definida';

            try {
                const options = {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                };

                return new Date(date).toLocaleDateString('pt-PT', options);
            } catch (error) {
                console.error('Error formatting date:', error);
                return 'Data inválida';
            }
        },

        handleReport(bloqueadoUser) {

            if (!bloqueadoUser) {
                console.error('Usuário não fornecido para denúncia');
                return;
            }

            // Usar o ID do usuário bloqueado corretamente
            this.selectedUser = {
                IdUtilizador: bloqueadoUser.IdBloqueado,
                Nome: bloqueadoUser.bloqueado.Nome
            };

            this.$nextTick(() => {
                const modal = this.$refs.denunciaModal;
                if (modal) {
                    modal.showModal();
                } else {
                    console.error('Modal de denúncia não encontrado');
                }
            });
        },

        handleDenunciaEnviada() {
            const modal = this.$refs.denunciaModal;
            if (modal && modal.$el) {
                const bsModal = Modal.getInstance(modal.$el);
                if (bsModal) {
                    // Add event listener for when modal is hidden
                    modal.$el.addEventListener('hidden.bs.modal', () => {
                        this.selectedUser = null;
                    }, { once: true });

                    // Hide the modal
                    bsModal.hide();
                } else {
                    // Fallback if modal instance not found
                    this.selectedUser = null;
                }
            }
        }
    }
}
</script>

<style scoped>
.btn-outline-danger {
    transition: all 0.2s;
}

.btn-outline-danger:hover {
    background-color: #dc3545;
    color: white;
}
</style>