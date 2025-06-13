<template>
    <div class="user-bloqueios-page d-flex">
        <UserSidebar v-if="userDetails" :userDetails="userDetails" />

        <!-- Main Content -->
        <div class="flex-grow-1 p-4 content">
            <h2 class="mb-4 fw-bold text-primary">Utilizadores Bloqueados</h2>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="alert alert-danger" role="alert">
                {{ error }}
            </div>

            <!-- UserBloqueadosList Component -->
            <div v-else class="table-responsive bg-white rounded shadow-sm p-3">
                <UserBloqueadosList :bloqueios="bloqueios" @desbloquear="desbloquearUtilizador" />
            </div>
        </div>
    </div>
</template>

<script>
import UserSidebar from '@/components/UserSidebar.vue';
import UserBloqueadosList from '@/components/UserBloqueadosList.vue';
import { utilizadorService } from '@/api/utilizador';

export default {
    name: 'UserBloqueadosView',
    components: {
        UserSidebar,
        UserBloqueadosList
    },
    data() {
        return {
            userDetails: null,
            bloqueios: null, // Inicialmente null em vez de array vazio
            loading: true,
            error: null
        }
    },
    methods: {
        async fetchUserDetails() {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    this.$router.push('/login');
                    return;
                }

                const payload = JSON.parse(atob(token.split('.')[1]));
                const userDetails = await utilizadorService.getUserDetails(payload.IdUtilizador);
                this.userDetails = userDetails;
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        },
        async fetchBloqueios() {
            try {
                this.loading = true;
                this.error = null;

                const token = sessionStorage.getItem('token');
                if (!token) return;

                const payload = JSON.parse(atob(token.split('.')[1]));
                const response = await fetch(`http://localhost:3000/bloqueios/utilizador?idBloqueador=${payload.IdUtilizador}`);

                if (!response.ok) {
                    throw new Error('Erro ao carregar utilizadores bloqueados');
                }

                const data = await response.json();
                // Garantir que os dados do usuário bloqueado estão acessíveis
                this.bloqueios = data.data.map(bloqueio => ({
                    ...bloqueio,
                    bloqueado: {
                        ...bloqueio.bloqueado,
                        Nome: bloqueio.bloqueado?.Nome || 'Usuário',
                        ImagemPerfil: bloqueio.bloqueado?.ImagemPerfil || 'https://via.placeholder.com/32'
                    },
                    DataBloqueio: bloqueio.DataBloqueio,
                    IdUtilizadoresBloqueados: bloqueio.IdUtilizadoresBloqueados
                }));

            } catch (error) {
                console.error('Error fetching blocked users:', error);
                this.error = 'Erro ao carregar utilizadores bloqueados';
            } finally {
                this.loading = false;
            }
        },
        async desbloquearUtilizador(idBloqueio) {
            if (confirm('Tem certeza que deseja desbloquear este utilizador?')) {
                try {
                    const response = await fetch(`http://localhost:3000/bloqueios/utilizador/${idBloqueio}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        throw new Error('Erro ao desbloquear utilizador');
                    }

                    // Atualizar a lista após desbloquear
                    await this.fetchBloqueios();
                } catch (error) {
                    console.error('Error unblocking user:', error);
                    alert('Erro ao desbloquear utilizador');
                }
            }
        },
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
        }
    },
    created() {
        this.fetchUserDetails();
        this.fetchBloqueios();
    }
}
</script>

<style scoped>
.user-bloqueios-page {
    min-height: 100vh;
    background: #f8f9fa;
    display: flex;
    width: 100%;
    padding-bottom: 100px;
}

.content {
    margin-left: 270px;
    /* Largura do sidebar */
    flex: 1;
    padding: 2rem;
    margin-top: 80px;
    /* Espaço para a navbar */
}

.table-responsive {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-top: 1rem;
}

.table th,
.table td {
    vertical-align: middle;
}

.btn-outline-danger {
    transition: all 0.2s;
}

.btn-outline-danger:hover {
    background-color: #dc3545;
    color: white;
}

@media (max-width: 768px) {
    .content {
        margin-left: 0;
        padding: 1rem;
        margin-top: 60px;
        /* Ajustado para telas menores */
    }
}
</style>