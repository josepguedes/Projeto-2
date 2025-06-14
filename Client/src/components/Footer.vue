<script>
import { RouterLink } from "vue-router";

</script>

<template>
    <footer class="footer mt-5 py-4 bg-white shadow-sm">
        <div class="container">
            <div class="row">
                <div class="col-lg-4 mb-3">
                    <h5 class="text-primary mb-3">FoodShare</h5>
                    <p class="text-muted">Plataforma de partilha de alimentos para reduzir o desperdício alimentar e
                        ajudar quem mais precisa.</p>
                </div>
                <div class="col-lg-2 col-md-3 mb-3">
                    <h6 class="text-dark mb-3">Links Úteis</h6>
                    <ul class="list-unstyled">
                        <li><router-link to="/" class="footer-link">Home</router-link></li>
                        <li><router-link to="/login" class="footer-link">Login</router-link></li>
                        <li><router-link to="/register" class="footer-link">Registrar</router-link></li>
                    </ul>
                </div>
                <div class="col-lg-3 col-md-4 mb-3">
                    <h6 class="text-dark mb-3">Contato</h6>
                    <ul class="list-unstyled">
                        <li class="text-muted mb-2">Email: info@foodshare.pt</li>
                        <li class="text-muted">Tel: +351 123 456 789</li>
                    </ul>
                </div>
                <div class="col-lg-3 col-md-4">
                    <h6 class="text-dark mb-3">Siga-nos</h6>
                    <div class="social-links">
                        <a href="#" class="me-3 text-primary">Facebook</a>
                        <a href="#" class="me-3 text-primary">Instagram</a>
                        <a href="#" class="text-primary">Twitter</a>
                    </div>
                </div>
            </div>
            <hr class="mt-4 mb-3">
            <div class="row">
                <div class="col-12 text-center">
                    <p class="text-muted mb-0">&copy; 2024 FoodShare. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.footer {
    margin-top: auto;
    border-top: 1px solid #e9ecef;
    z-index: 2000 !important;
    position: relative;
}

.footer-link {
    color: #6c757d;
    text-decoration: none;
    transition: color 0.2s ease;
    display: inline-block;
    margin-bottom: 0.5rem;
}

.footer-link:hover {
    color: #33A58C;
}

.social-links a {
    color: #33A58C !important;
}

.social-links a:hover {
    opacity: 0.8;
}

.text-muted {
    color: #6c757d !important;
    font-size: 0.9rem;
}
</style>