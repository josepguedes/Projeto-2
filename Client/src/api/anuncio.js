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
    }

    
};

export const denunciasService = {
    async createDenuncia(denuncia) {
        const response = await fetch(`${API_URL}/denuncias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                IdUtilizadorDenunciante: 1, // Substituir pelo ID do utilizador logado
                IdUtilizadorDenunciado: denuncia.IdUtilizadorDenunciado,
                Motivo: denuncia.Motivo,
                DataDenuncia: new Date().toISOString(),
                IdAnuncio: denuncia.IdAnuncio
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao enviar denúncia');
        }

        return response.json();
    }
};