<template>
    <button @click="handleBlock" :class="buttonClass">
        <i class="bi" :class="isBlocked ? 'bi-unlock' : 'bi-slash-circle'"></i>
        {{ isBlocked ? 'Desbloquear' : 'Bloquear' }}
    </button>
</template>

<script>
export default {
    name: 'BlockUserButton',
    props: {
        userId: {
            type: Number,
            required: true
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        variant: {
            type: String,
            default: 'btn-outline-danger' // ou 'btn-sm btn-outline-danger'
        }
    },
    computed: {
        buttonClass() {
            return `btn ${this.variant}`;
        }
    },
    methods: {
        async handleBlock() {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    this.$router.push('/login');
                    return;
                }

                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentUserId = payload.IdUtilizador;

                if (this.isBlocked) {
                    // Desbloquear
                    const response = await fetch(`http://localhost:3000/bloqueios/utilizador/${this.userId}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) throw new Error('Erro ao desbloquear utilizador');
                } else {
                    // Bloquear
                    const response = await fetch('http://localhost:3000/bloqueios/utilizador', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            IdBloqueador: currentUserId,
                            IdBloqueado: this.userId
                        })
                    });
                    if (!response.ok) throw new Error('Erro ao bloquear utilizador');
                }

                this.$emit('blocked-status-changed');
            } catch (error) {
                console.error('Erro ao bloquear/desbloquear:', error);
                alert(error.message);
            }
        }
    }
}
</script>