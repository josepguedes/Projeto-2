const API_URL = 'http://localhost:3000';

export const bloqueiosService = {
  async getUserBloqueios(idBloqueador, page = 1, limit = 10) {
    const token = sessionStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/bloqueios/utilizador?idBloqueador=${idBloqueador}&page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar utilizadores bloqueados');
    }

    return response.json();
  },

  async blockUser(idBloqueador, idBloqueado) {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/bloqueios/utilizador`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        IdBloqueador: idBloqueador,
        IdBloqueado: idBloqueado
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao bloquear utilizador');
    }

    return response.json();
  },

  async unblockUser(idBloqueio) {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/bloqueios/utilizador/${idBloqueio}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao desbloquear utilizador');
    }

    return response.json();
  },

  async checkBlockStatus(idBloqueador, idBloqueado) {
    const token = sessionStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/bloqueios/utilizador/check?idBloqueador=${idBloqueador}&idBloqueado=${idBloqueado}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao verificar status de bloqueio');
    }

    return response.json();
  }
};