import 'whatwg-fetch';
import { utilizadorService } from '@/api/utilizador';

const TEST_USER_EMAIL = 'selenium26809@gmail.com';
const TEST_USER_PASSWORD = '123456';

describe('utilizadorService.login', () => {
  beforeEach(async () => {
    await utilizadorService.logout(); // Garante que o utilizador está desconectado antes do teste
  });

  it('deve fazer login com credenciais válidas', async () => {
    await utilizadorService.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  });

  it('não deve fazer login com credenciais inválidas', async () => {
    await expect(utilizadorService.login('email-invalido@teste.com', 'senhaerrada')).rejects.toThrow();
  });
});

describe('utilizadorService.getUserDetails', () => {
  let userId = null;

  beforeAll(async () => {
    await utilizadorService.logout(); // Garante que o utilizador está desconectado antes do teste
    await utilizadorService.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    // Decodifica o token para obter o IdUtilizador
    const token = sessionStorage.getItem('token');
    const payload = JSON.parse(atob(token.split('.')[1]));
    userId = payload.IdUtilizador;
  });

  it('deve buscar detalhes do utilizador autenticado', async () => {
    const user = await utilizadorService.getUserDetails(userId);
    expect(user).toHaveProperty('IdUtilizador', userId);
    expect(user).toHaveProperty('Nome');
    expect(user).toHaveProperty('Email');
  });

  it('deve lançar erro ao buscar detalhes de utilizador inexistente', async () => {
    await expect(utilizadorService.getUserDetails(999999)).rejects.toThrow();
  });
});