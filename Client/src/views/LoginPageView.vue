<template>
    <div class="login-page">
        <h1>Login</h1>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" v-model="password" placeholder="Enter your password" required />
            </div>
            <button type="submit">Login</button>
            <p v-if="error" style="color: red;">{{ error }}</p>
        </form>
        <p class="register-text">
            Não tem uma conta? <router-link to="/register">Registe-se aqui</router-link>
        </p>
    </div>
</template>
<script>
export default {
    name: "LoginPageView",
    data() {
        return {
            email: "",
            password: "",
            error: ""
        };
    },
    methods: {
        async checkAdminBlock(userId) {
            try {
                const response = await fetch(`http://localhost:3000/bloqueios/admin/check/${userId}`);
                if (!response.ok) {
                    throw new Error('Erro ao verificar bloqueio');
                }
                const data = await response.json();
                return data;
            } catch (error) {
                throw error;
            }
        },

        formatBlockEndDate(date) {
            if (!date) return 'permanentemente';
            return new Date(date).toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        },

        async handleLogin() {
            this.error = "";
            if (!this.email || !this.password) {
                this.error = "Por favor, preencha todos os campos.";
                return;
            }
            try {
                const response = await fetch("http://localhost:3000/utilizadores/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        Email: this.email,
                        Password: this.password
                    })
                });
                const data = await response.json();

                if (!response.ok) {
                    this.error = data.message || data.error || "Falha no login.";
                    return;
                }

                // Verificar bloqueio administrativo antes de prosseguir com o login
                const blockCheck = await this.checkAdminBlock(data.user.IdUtilizador);

                if (blockCheck.bloqueado) {
                    const endDate = blockCheck.bloqueio?.DataFimBloqueio;
                    this.error = endDate
                        ? `A sua conta está bloqueada até ${this.formatBlockEndDate(endDate)}`
                        : 'A sua conta está permanentemente bloqueada';
                    return;
                }

                // Se não estiver bloqueado, procede com o login normal
                sessionStorage.setItem("token", data.token);
                window.dispatchEvent(new Event('auth-changed'));
                this.$router.push("/");

            } catch (err) {
                this.error = "Erro de conexão com o servidor.";
                console.error(err);
            }
        }
    }
};
</script>

<style scoped>
.login-page {
    max-width: 400px;
    margin-top: 200px !important;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 120px;
}

h1 {
    text-align: center;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
}

.register-text a {
    color: #33A58C;
}

button:hover {
    background-color: #2a8873;
}

.register-text a:hover {
    text-decoration: underline;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #33A58C;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>