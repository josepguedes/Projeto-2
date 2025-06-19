import 'whatwg-fetch';
import { denunciasService } from '@/api/denuncia';
import { utilizadorService } from '@/api/utilizador';

const TEST_USER_EMAIL = 'selenium26809@gmail.com';
const TEST_USER_PASSWORD = '123456';

let createdDenunciaId = null;

beforeAll(async () => {
  await utilizadorService.logout(); // Garante que o utilizador está desconectado antes do teste
  await utilizadorService.login(TEST_USER_EMAIL, TEST_USER_PASSWORD); // Login do utilizador de teste
});

describe('denunciasService.getAllDenuncias', () => {
  it('deve retornar uma lista de denúncias', async () => {
    const result = await denunciasService.getAllDenuncias();
    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.data)).toBe(true);
  });
});

describe('denunciasService.createDenuncia e deleteDenuncia', () => {
  it('deve criar e eliminar uma denúncia', async () => {
    // Ajuste os IDs conforme necessário para o seu ambiente
    const denuncia = {
      IdUtilizadorDenunciante: 1,
      IdUtilizadorDenunciado: 2,
      Motivo: 'Motivo de teste Jest'
    };
    const response = await denunciasService.createDenuncia(denuncia);
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('IdDenuncia');
    createdDenunciaId = response.data.IdDenuncia;

    // Elimina denúncia criada
    const deleteResult = await denunciasService.deleteDenuncia(createdDenunciaId);
    expect(deleteResult.ok || deleteResult.status === 200).toBe(true);
  });

  it('deve lançar erro ao eliminar denúncia inexistente', async () => {
    await expect(denunciasService.deleteDenuncia(999)).rejects.toThrow();
  });
});