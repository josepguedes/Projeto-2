import 'whatwg-fetch';
import { avaliacoesService } from '@/api/avaliacoes';

describe('avaliacoesService', () => {
  it('deve buscar avaliações com sucesso', async () => {
    const result = await avaliacoesService.getAllAvaliacoes();
    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.data)).toBe(true);
  });
});
