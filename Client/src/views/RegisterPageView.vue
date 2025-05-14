<template>
    <div class="register-page">
        <form class="register-form">
            <h1>Register</h1>
            <div class="form-group">
                <label for="name">Nome</label>
                <input type="text" id="name" placeholder="Digite seu nome" />
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="Digite seu email" />
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Digite sua senha" />
            </div>
            <button type="submit">Registrar</button>
            <p class="login-text">
                Já possui uma conta? <router-link to="/login">Faça login aqui</router-link>
            </p>
        </form>
    </div>
</template>

<script>
export default {
    name: "RegisterPageView",
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
    color: #007bff;
    text-decoration: none;
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

button {
    width: 100%;
    padding: 0.75rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}
</style>