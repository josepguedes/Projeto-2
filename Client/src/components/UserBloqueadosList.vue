<template>
    <div class="user-bloqueados-list">
        <!-- Empty State -->
        <div v-if="bloqueios.length === 0" class="text-center text-muted py-4">
            <i class="bi bi-slash-circle fs-3 d-block mb-2"></i>
            Nenhum utilizador bloqueado encontrado
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
                            <img :src="bloqueio.bloqueado?.ImagemPerfil || 'https://via.placeholder.com/32'" 
                                 alt="Utilizador" 
                                 class="rounded-circle" 
                                 width="32" 
                                 height="32" />
                            <div>
                                <div class="fw-medium mb-0">{{ bloqueio.bloqueado?.Nome || 'Utilizador' }}</div>
                                <small class="text-muted">{{ bloqueio.bloqueado?.Email || 'Email não disponível' }}</small>
                            </div>
                        </div>
                    </td>
                    <td>{{ formatDate(bloqueio.DataBloqueio) }}</td>
                    <td class="text-end pe-4">
                        <button @click="$emit('desbloquear', bloqueio.IdUtilizadoresBloqueados)" 
                                class="btn btn-sm btn-outline-danger">
                            <i class="bi bi-unlock me-1"></i> Desbloquear
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    name: 'UserBloqueadosList',
    props: {
        bloqueios: {
            type: Array,
            required: true
        }
    },
    emits: ['desbloquear'],
    methods: {
        formatDate(date) {
            if (!date) return 'Data não definida';
            
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            
            return new Date(date).toLocaleDateString('pt-PT', options);
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