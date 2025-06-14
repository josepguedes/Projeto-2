<template>
    <div class="reservas-page">
        <div class="container py-5 forms">
            <div class="row">
                <!-- Sidebar -->
                <div class="col-lg-3 mb-4 sidebar">
                    <UserSidebar :userDetails="userDetails" />
                </div>

                <!-- Conteúdo principal -->
                <div class="col-lg-8">
                    <h2 class="mb-4">Minhas Reservas</h2>
                    <div v-if="loading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                    <div v-else-if="error" class="alert alert-danger">
                        {{ error }}
                    </div>
                    <div v-else-if="reservas.length === 0" class="text-center py-5">
                        <i class="bi bi-calendar-x display-1 text-muted"></i>
                        <p class="mt-3 text-muted">Você ainda não possui reservas realizadas.</p>
                        <router-link to="/" class="btn btn-primary mt-3">
                            Explorar Anúncios
                        </router-link>
                    </div>
                    <div v-else>
                        <!-- filepath: c:\Users\josep\OneDrive - Instituto Politécnico do Porto\Faculdade\2º ano\2º Semestre\Projeto-2\Client\src\views\UserReservasView.vue -->
                        <div class="row g-4">
                            <div class="col-12" v-for="reserva in reservas" :key="reserva.IdAnuncio">
                                <UserReservaCard :reserva="reserva" @payment-success="fetchReservas"
                                    @cancelar="handleCancelarReserva" />
                            </div>
                        </div>«
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import UserReservaCard from '@/components/UserReservaCard.vue';
import { utilizadorService } from '@/api/utilizador';
import { anunciosService } from '@/api/anuncio';
import UserSidebar from '@/components/UserSidebar.vue';

export default {
    name: 'UserReservasView',
    components: {
        UserSidebar,
        UserReservaCard
    },
    data() {
        return {
            userDetails: null,
            reservas: [],
            loading: true,
            error: null
        }
    },
    methods: {
        async fetchUserDetailsAndReservas() {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    this.$router.push('/login');
                    return;
                }
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userDetails = await utilizadorService.getUserDetails(payload.IdUtilizador);
                this.userDetails = userDetails;
                await this.fetchReservas(payload.IdUtilizador);
            } catch (error) {
                this.error = 'Erro ao carregar dados do utilizador.';
                this.loading = false;
            }
        },
        async fetchReservas(userId) {
            try {
                this.loading = true;
                const response = await anunciosService.getReservasByUser(userId, 1, 100);
                this.reservas = response.data || [];
            } catch (error) {
                this.error = 'Erro ao carregar reservas.';
            } finally {
                this.loading = false;
            }
        },
        async handleCancelarReserva(reserva) {
            try {
                await anunciosService.updateAnuncio(reserva.IdAnuncio, {
                    Nome: reserva.Nome,
                    Descricao: reserva.Descricao,
                    LocalRecolha: reserva.LocalRecolha,
                    HorarioRecolha: reserva.HorarioRecolha,
                    Preco: reserva.Preco,
                    DataRecolha: reserva.DataRecolha,
                    DataValidade: reserva.DataValidade,
                    Quantidade: reserva.Quantidade,
                    IdProdutoCategoria: reserva.IdProdutoCategoria,
                    IdEstadoAnuncio: 1,
                    IdUtilizadorReserva: null,
                    DataReserva: null,
                    CodigoVerificacao: null
                });
                this.reservas = this.reservas.filter(r => r.IdAnuncio !== reserva.IdAnuncio);
            } catch (err) {
                console.log(reserva);

                alert('Erro ao cancelar reserva');
            }
        }
    },
    created() {
        this.fetchUserDetailsAndReservas();
    }
}
</script>

<style scoped>
.reservas-page {
    padding-top: 80px;
    min-height: 100vh;
    background-color: #f8f9fa;
}

.forms {
    margin-top: 20px;
}

h2 {
    color: #333;
    font-weight: 600;
}
</style>