import 'whatwg-fetch';
import { anunciosService } from '@/api/anuncio';
import { utilizadorService } from '@/api/utilizador';

const TEST_USER_EMAIL = 'selenium26809@gmail.com';
const TEST_USER_PASSWORD = '123456';

let createdAnuncioId = null;

beforeAll(async () => {
  await utilizadorService.logout(); // Garante que o utilizador está desconectado antes do teste
  await utilizadorService.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);   // Login do utilizador de teste
});

describe('anunciosService.getAllAnuncios', () => {
  it('deve retornar uma lista de anúncios', async () => {
    const result = await anunciosService.getAllAnuncios();
    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.data)).toBe(true);
  });
});

describe('anunciosService.createAnuncio e deleteAnuncio', () => {
  it('deve criar e eliminar um anúncio', async () => {
    const anuncioData = {
      Nome: 'Anúncio Teste',
      Descricao: 'Descrição do anúncio de teste',
      LocalRecolha: 'Lisboa',
      HorarioRecolha: '09:00-18:00',
      Preco: 10,
      DataRecolha: '2025-06-20',
      DataValidade: '2025-06-30',
      Quantidade: 1,
      IdProdutoCategoria: 1
    };

    // Cria anúncio
    const response = await anunciosService.createAnuncio(anuncioData);
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('IdAnuncio');
    createdAnuncioId = response.data.IdAnuncio;

    // Elimina anúncio criado
    const deleteResult = await anunciosService.deleteAnuncio(createdAnuncioId);
    expect(deleteResult).toBe(true);
  });
});

describe('anunciosService.getAnuncioById', () => {
  it('deve retornar null ou erro para um anúncio inexistente', async () => {
    await expect(anunciosService.getAnuncioById(999999)).rejects.toThrow();
  });
});