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
                DataNascimento: utilizador.DataNascimento,
                Telefone: utilizador.Telefone,
                Morada: utilizador.Morada
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar utilizador');
        }

        return response.json();
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

    async updateUser(userId, formData) {
        const token = sessionStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/utilizadores/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type - browser will set it with boundary
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao atualizar utilizador');
            }

            return response.json();
        } catch (error) {
            throw new Error(error.message || 'Erro ao atualizar utilizador');
        }
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
    }
};