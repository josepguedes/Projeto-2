<template>
    <div class="login-page">
        <h1>Login</h1>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    v-model="email"
                    placeholder="Enter your email"
                    required
                />
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    v-model="password"
                    placeholder="Enter your password"
                    required
                />
            </div>
            <button type="submit">Login</button>
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
        };
    },
    methods: {
        handleLogin() {
            if (this.email && this.password) {
                console.log("Email:", this.email);
                console.log("Password:", this.password);
                // Add your login logic here
            } else {
                alert("Please fill in all fields.");
            }
        },
    },
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

.register-text {
    text-align: center;
    margin-top: 15px;
    font-size: 0.9rem;
}

.register-text a {
    color: #007bff;
    text-decoration: none;
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

button:hover {
    background-color: #0056b3;
}
</style>