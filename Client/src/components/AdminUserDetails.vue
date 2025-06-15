<template>
    <div class="modal fade" :class="{ 'show d-block': user }" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <!-- Header -->
                <div class="modal-header">
                    <h5 class="modal-title">Detalhes do Utilizador</h5>
                    <button type="button" class="btn-close" @click="$emit('close')"></button>
                </div>

                <!-- Body -->
                <div class="modal-body">
                    <!-- User Profile Section -->
                    <div class="user-profile text-center mb-4">
                        <img :src="user.ImagemPerfil || 'https://via.placeholder.com/100'" 
                             alt="Profile" 
                             class="profile-image rounded-circle mb-3">
                        <h4 class="user-name mb-2">{{ user.Nome }}</h4>
                        <span :class="['role-badge', roleClass(user.Funcao)]">
                            {{ user.Funcao }}
                        </span>
                    </div>

                    <!-- User Info Grid -->
                    <div class="user-info-grid">
                        <div class="info-card">
                            <i class="bi bi-envelope text-primary"></i>
                            <div class="info-content">
                                <span class="info-label">Email</span>
                                <span class="info-value">{{ user.Email }}</span>
                            </div>
                        </div>

                        <div class="info-card">
                            <i class="bi bi-person-vcard text-primary"></i>
                            <div class="info-content">
                                <span class="info-label">NIF</span>
                                <span class="info-value">{{ user.Nif || 'Não definido' }}</span>
                            </div>
                        </div>

                        <div class="info-card">
                            <i class="bi bi-calendar-date text-primary"></i>
                            <div class="info-content">
                                <span class="info-label">Data de Nascimento</span>
                                <span class="info-value">{{ formatDate(user.DataNascimento) }}</span>
                            </div>
                        </div>

                        <div class="info-card">
                            <i class="bi bi-calendar-check text-primary"></i>
                            <div class="info-content">
                                <span class="info-label">Data de Registo</span>
                                <span class="info-value">{{ formatDate(user.DataRegisto) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AdminUserDetails',
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    methods: {
        formatDate(date) {
            if (!date) return 'Não definido';
            return new Date(date).toLocaleDateString('pt-PT');
        },
        roleClass(role) {
            const roleClasses = {
                admin: 'bg-danger',
                user: 'bg-primary'
            };
            return roleClasses[role?.toLowerCase()] || 'bg-secondary';
        }
    }
};
</script>

<style scoped>
.modal {
    background-color: rgba(0, 0, 0, 0.5);
    transition: opacity 0.3s ease;
}

.modal.fade {
    opacity: 0;
}

.modal.show {
    opacity: 1;
}

.modal-dialog {
    transform: translateY(-50px);
    transition: transform 0.3s ease;
}

.modal.show .modal-dialog {
    transform: translateY(0);
}

.modal-content {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 100%;
}

.modal-header {
    border-bottom: 1px solid #eee;
    padding: 1.25rem;
}

.modal-body {
    padding: 2rem;
}

/* Profile Section */
.profile-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-name {
    color: #333;
    font-weight: 600;
}

.role-badge {
    font-size: 0.875rem;
    padding: 0.5em 1.25em;
    border-radius: 20px;
    font-weight: 500;
}

/* Info Grid */
.user-info-grid {
    display: grid;
    gap: 1.25rem;
    margin-top: 1.5rem;
}

.info-card {
    display: flex;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    transition: transform 0.2s;
}

.info-card:hover {
    transform: translateY(-2px);
}

.info-card i {
    font-size: 1.25rem;
    margin-right: 1rem;
}

.info-content {
    display: flex;
    flex-direction: column;
}

.info-label {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
}

.info-value {
    color: #333;
    font-weight: 500;
}
</style>