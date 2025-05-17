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

    async updateUser(userId, utilizador) {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/utilizadores/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(utilizador)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar utilizador');
        }

        return response.json();
    }
};