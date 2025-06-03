const API_URL = 'http://localhost:3000'; // Ajuste para a URL do seu backend

export const anunciosService = {
    async getAllAnuncios(page = 1, limit = 10, filters = {}) {
        const queryParams = new URLSearchParams({
            page,
            limit,
            ...filters
        });

        const response = await fetch(`${API_URL}/anuncios?${queryParams}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar anúncios');
        }
        return response.json();
    },

    async getAnuncioById(id) {
        const response = await fetch(`${API_URL}/anuncios/${id}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar anúncio');
        }
        return response.json();
    },

    async getUserAnuncios(userId, page = 1, limit = 10) {
        const queryParams = new URLSearchParams({
            page,
            limit
        });

        const response = await fetch(`${API_URL}/anuncios/utilizador/${userId}?${queryParams}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar anúncios do utilizador');
        }
        return response.json();
    },

    async createAnuncio(anuncioData) {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            // Get user ID from token
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.IdUtilizador;

            // Format the data before sending test
            const formattedData = {
                IdUtilizadorAnuncio: userId, 
                Nome: anuncioData.Nome,
                Descricao: anuncioData.Descricao,
                LocalRecolha: anuncioData.LocalRecolha,
                HorarioRecolha: anuncioData.HorarioRecolha,
                Preco: parseFloat(anuncioData.Preco),
                DataRecolha: new Date(anuncioData.DataRecolha).toISOString().split('T')[0],
                DataValidade: new Date(anuncioData.DataValidade).toISOString().split('T')[0],
                Quantidade: parseInt(anuncioData.Quantidade),
                IdProdutoCategoria: parseInt(anuncioData.IdProdutoCategoria),
                ImagemAnuncio: anuncioData.ImagemAnuncio || 'https://placehold.co/500',
                IdEstadoAnuncio: 1
            };

            console.log('Sending data:', formattedData);

            const response = await fetch(`${API_URL}/anuncios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formattedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(errorData.message || 'Erro ao criar anúncio');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw new Error(`Erro ao criar anúncio: ${error.message}`);
        }
    }


};