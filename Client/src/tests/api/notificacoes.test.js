import 'whatwg-fetch';
import { notificacoesService } from '@/api/notificacoes';
import { utilizadorService } from '@/api/utilizador';

const TEST_ADMIN_EMAIL = 'selenium26809@gmail.com';
const TEST_ADMIN_PASSWORD = '123456';

beforeAll(async () => {
  await utilizadorService.logout();
  await utilizadorService.login(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
});

describe('notificacoesService.getAllNotificacoes', () => {
  it('deve retornar uma lista de notificações', async () => {
    const result = await notificacoesService.getAllNotificacoes();
    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.data)).toBe(true);
  });
});

describe('notificacoesService.getNotificacoesByUserId', () => {
  it('deve retornar notificações do utilizador', async () => {
    const result = await notificacoesService.getNotificacoesByUserId(11);
    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.data)).toBe(true);
  });
});

describe('notificacoesService.associarNotificacaoAUtilizador', () => {
  it('deve lançar erro ao associar notificação inexistente', async () => {
    await expect(
      notificacoesService.associarNotificacaoAUtilizador({
        IdNotificacao: 999999,
        IdUtilizador: 11,
      })
    ).rejects.toThrow();
  });
});