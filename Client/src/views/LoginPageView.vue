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
            Não tem uma conta? <router-link to="/register">Registre-se aqui</router-link>
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
                } else {
                    // Salva o token JWT no localStorage
                    sessionStorage.setItem("token", data.token);
                    // Redireciona para a home ou dashboard
                    this.$router.push("/").then(() => {
                        window.location.reload();
                    });
                }
            } catch (err) {
                this.error = "Erro de conexão com o servidor.";
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

button {
    background-color: #33A58C;
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
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>