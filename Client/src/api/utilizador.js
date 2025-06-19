const API_URL = 'http://localhost:3000';

export const utilizadorService = {
    async createUtilizador(utilizador) {
        const response = await fetch(`${API_URL}/utilizadores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Nome: utilizador.Nome,
                Email: utilizador.Email,
                Password: utilizador.Password,
                DataNascimento: utilizador.DataNascimento
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar utilizador');
        }

        return response.json();
    },
    async login(email, password) {
        try {
            const response = await fetch("http://localhost:3000/utilizadores/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Email: email,
                    Password: password
                })
            });
            const data = await response.json();

            if (!response.ok) {
                this.error = data.message || data.error || "Falha no login.";
                throw new Error(this.error);
            }

            sessionStorage.setItem("token", data.token);

        } catch (err) {
            this.error = "Erro ao tentar fazer login.";
            console.log(err);
            throw new Error(this.error);
        }
    },
    async logout() {
        sessionStorage.removeItem('token');
    },

    async getUserDetails(userId) {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/utilizadores/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }
        return response.json();
    },

    async updateUser(userId, data, isFormData = false) {
        const token = sessionStorage.getItem('token');
        const url = `${API_URL}/utilizadores/${userId}`;
        let options = {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        if (isFormData) {
            options.body = data;
        } else {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar utilizador');
        }

        return response.json();
    },

    async getAllUsers(page = 1, limit = 10) {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/utilizadores?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },
};