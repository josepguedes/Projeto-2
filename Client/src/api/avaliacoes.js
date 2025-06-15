const API_URL = 'http://localhost:3000';

export const avaliacoesService = {
    async getAllAvaliacoes(page = 1, limit = 10) {
        const response = await fetch(`${API_URL}/avaliacoes?page=${page}&limit=${limit}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar avaliações');
        }

        const data = await response.json();
        
        // Buscar detalhes dos utilizadores para cada avaliação
        const avaliacoesComDetalhes = await Promise.all(
            data.data.map(async (avaliacao) => {
                const [autorResponse, avaliadoResponse] = await Promise.all([
                    fetch(`${API_URL}/utilizadores/${avaliacao.IdAutor}`),
                    fetch(`${API_URL}/utilizadores/${avaliacao.IdAvaliado}`)
                ]);

                const autor = await autorResponse.json();
                const avaliado = await avaliadoResponse.json();

                return {
                    ...avaliacao,
                    autor,
                    avaliado
                };
            })
        );
        return {
            ...data,
            data: avaliacoesComDetalhes
        };
    },

    async createAvaliacao({ IdAnuncio, IdAutor, IdAvaliado, Comentario, Classificacao }) {
        const response = await fetch(`${API_URL}/avaliacoes`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                IdAnuncio,
                IdAutor,
                IdAvaliado: IdAvaliado,
                Comentario,
                Classificacao
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar avaliação');
        }

        return response.json();
    },

    async deleteAvaliacao(id) {
        const response = await fetch(`${API_URL}/avaliacoes/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Erro ao eliminar avaliação');
        }
        return response;
    }
};