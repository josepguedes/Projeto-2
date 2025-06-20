import 'whatwg-fetch';
import { adminBloqueiosService } from '@/api/adminBloqueios';
import { utilizadorService } from '@/api/utilizador';

const TEST_ADMIN_EMAIL = 'selenium26809@gmail.com';
const TEST_ADMIN_PASSWORD = '123456';
const TEST_USER_ID = 1;

let createdAdminBlockId = null;

beforeAll(async () => {
  await utilizadorService.logout();
  await utilizadorService.login(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
});

describe('adminBloqueiosService.checkAdminBlock', () => {
  it('deve retornar status de bloqueio administrativo (mesmo que não bloqueado)', async () => {
    const result = await adminBloqueiosService.checkAdminBlock(TEST_USER_ID);
    expect(result).toHaveProperty('bloqueado');
  });
});

describe('adminBloqueiosService.createBloqueio e deleteBloqueio', () => {
  it('deve criar e eliminar um bloqueio administrativo', async () => {
    // Cria bloqueio admin
    const response = await adminBloqueiosService.createBloqueio(TEST_USER_ID);
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('IdAdminBloqueados');

    // Elimina bloqueio criado
    const deleteResult = await adminBloqueiosService.deleteBloqueio(69);
    expect(deleteResult.ok || deleteResult.status === 200).toBe(true);
  });

  it('deve lançar erro ao eliminar bloqueio inexistente', async () => {
    await expect(adminBloqueiosService.deleteBloqueio(999)).rejects.toThrow();
  });
});