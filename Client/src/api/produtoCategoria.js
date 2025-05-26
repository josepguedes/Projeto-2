const API_URL = 'http://localhost:3000';

export const produtoCategoriaService = {
    async getAllCategorias(page = 1, limit = 10) {
        try {
            const response = await fetch(`${API_URL}/categorias?page=${page}&limit=${limit}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao buscar categorias');
            }

            return response.json();
        } catch (err) {
            console.error('Error in getAllCategorias:', err);
            throw new Error('Erro ao buscar categorias');
        }
    },

    async createCategoria(categoria) {
        const response = await fetch(`${API_URL}/produto-categorias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoria)
        });

        if (!response.ok) {
            throw new Error('Erro ao criar categoria');
        }

        return response.json();
    },

    async deleteCategoria(id) {
        const response = await fetch(`${API_URL}/produto-categorias/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erro ao eliminar categoria');
        }

        return true;
    }
};