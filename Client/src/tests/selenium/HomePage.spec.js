import { Builder, By, until } from 'selenium-webdriver';

(async function testHomePage() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    // Abrir a homepage
    await driver.get('http://localhost:5173/');

    // Verificar se o título principal está presente
    const title = await driver.findElement(By.css('h1.title')).getText();
    if (!title.includes('Encontre Produtos Próximos')) {
      throw new Error('Título principal não encontrado!');
    }

    // Verificar se o campo de pesquisa existe
    await driver.findElement(By.css('input[placeholder="Pesquisar produtos..."]'));

    // Verificar se o filtro de categoria existe
    await driver.findElement(By.id('filterCategoria'));

    // Fazer uma pesquisa e verificar resultados
    await driver.findElement(By.css('input[placeholder="Pesquisar produtos..."]')).sendKeys('arroz');
    await driver.findElement(By.css('button.btn.btn-primary')).click();
    await driver.wait(until.elementLocated(By.css('.row .col')), 5000);

    // Testar paginação se houver mais de uma página
    const paginacao = await driver.findElements(By.css('.pagination .page-link'));
    if (paginacao.length > 0) {
      await paginacao[1].click(); // Vai para a página 2 se existir
    }

    console.log('Teste da homepage passou!');
  } catch (err) {
    console.error('Teste da homepage falhou:', err);
  } finally {
    await driver.quit();
  }
})();