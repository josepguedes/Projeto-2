<template>
    <div class="register-page">
        <form class="register-form" @submit.prevent="registerUser">
            <h1>Register</h1>
            <div class="form-group">
                <label for="name">Nome</label>
                <input type="text" id="name" v-model="nome" placeholder="Digite seu nome" required />
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="email" placeholder="Digite seu email" required />
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" v-model="password" placeholder="Digite sua senha" required />
            </div>
            <button type="submit">Registrar</button>
            <p class="login-text">
                Já possui uma conta? <router-link to="/login">Faça login aqui</router-link>
            </p>
            <p v-if="error" style="color: red;">{{ error }}</p>
            <p v-if="success" style="color: green;">{{ success }}</p>
        </form>
    </div>
</template>

<script>
export default {
    name: "RegisterPageView",
    data() {
        return {
            nome: "",
            email: "",
            password: "",
            error: "",
            success: ""
        };
    },
    methods: {
        async registerUser() {
            this.error = "";
            this.success = "";
            try {
                const response = await fetch("http://localhost:3000/utilizadores/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        Nome: this.nome,
                        Email: this.email,
                        Password: this.password
                    })
                });
                const data = await response.json();
                if (!response.ok) {
                    this.error = data.message || data.error || "Erro ao registrar.";
                } else {
                    this.success = "Registro realizado com sucesso!";
                    setTimeout(() => this.$router.push('/login'), 1500);
                }
            } catch (err) {
                this.error = "Erro de conexão com o servidor.";
            }
        }
    }
};
</script>

<style scoped>
.register-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
}

.register-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
}

.register-form h1 {
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1rem;
    text-align: left;
}

.login-text {
    text-align: center;
    margin-top: 15px;
    font-size: 0.9rem;
}

.login-text a {
    color: #33A58C;
}

button:hover {
    background-color: #2a8873;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #33A58C ;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.login-text a:hover {
    text-decoration: underline;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.form-group input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}

</style>