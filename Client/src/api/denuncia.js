const API_URL = 'http://localhost:3000';

export const denunciasService = {
    async createDenuncia(denuncia) {
        const response = await fetch(`${API_URL}/denuncias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                IdUtilizadorDenunciante: 1, // Por enquanto fixo, depois usar do login
                IdUtilizadorDenunciado: denuncia.IdUtilizadorDenunciado,
                IdAnuncio: denuncia.IdAnuncio,
                Motivo: denuncia.Motivo,
                DataDenuncia: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao enviar denúncia');
        }

        return response.json();
    }
};