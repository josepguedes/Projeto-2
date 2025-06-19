import 'whatwg-fetch';
import { produtoCategoriaService } from '@/api/produtoCategoria';
import { utilizadorService } from '@/api/utilizador';

const TEST_USER_EMAIL = 'selenium26809@gmail.com';
const TEST_USER_PASSWORD = '123456';


beforeAll(async () => {
  await utilizadorService.logout(); // Garante que o utilizador está desconectado antes do teste
  await utilizadorService.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);   // Login do utilizador de teste
});

describe('produtoCategoriaService.getAllCategorias', () => {
  it('deve retornar uma lista de categorias', async () => {
    const result = await produtoCategoriaService.getAllCategorias();
    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.data)).toBe(true);
  });
});

describe('produtoCategoriaService.createCategoria e deleteCategoria', () => {
  let createdCategoriaId = null;

  it('deve criar e eliminar uma categoria', async () => {
    // Cria categoria
    const categoria = { NomeCategoria: 'Categoria Teste Jest' };
    const response = await produtoCategoriaService.createCategoria(categoria);
    expect(response).toHaveProperty('data');
    expect(response.data).toHaveProperty('IdProdutoCategoria');
    createdCategoriaId = response.data.IdProdutoCategoria;

    // Elimina categoria criada
    const deleteResult = await produtoCategoriaService.deleteCategoria(createdCategoriaId);
    expect(deleteResult).toBe(true);
  });

  it('deve lançar erro ao eliminar categoria inexistente', async () => {
    await expect(produtoCategoriaService.deleteCategoria(999)).rejects.toThrow();
  });
});