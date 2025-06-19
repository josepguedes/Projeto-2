import { Builder, By, until } from 'selenium-webdriver';

(async function testAnuncioDetail() {
  let driver = await new Builder().forBrowser('chrome').build();

  // Substitui pelo ID de um anúncio válido na tua base de dados
  const anuncioId = 1;

  try {
    // 1. Carregar página de detalhe
    await driver.get(`http://localhost:5173/anuncios/${anuncioId}`);

    // 2. Verificar se aparece o botão de voltar
    await driver.findElement(By.css('a.btn.btn-link'));

    // 3. Verificar se aparece o componente de detalhes (pode adaptar o seletor)
    await driver.wait(until.elementLocated(By.css('.anuncio-detail-page')), 5000);

    // 4. Testar botão de reservar sem login
    await driver.findElement(By.xpath("//button[contains(.,'Reservar')]")).click();
    await driver.wait(until.urlContains('/login'), 3000);

    // 5. Voltar para o anúncio e testar denúncia sem login
    await driver.get(`http://localhost:5173/anuncios/${anuncioId}`);
    await driver.findElement(By.xpath("//button[contains(.,'Denunciar')]")).click();
    await driver.wait(until.urlContains('/login'), 3000);

    // 6. Testar erro para anúncio inexistente
    await driver.get('http://localhost:5173/anuncios/999999');
    const errorElem = await driver.wait(until.elementLocated(By.css('.alert-danger')), 5000);
    const errorMsg = await errorElem.getText();
    if (!errorMsg.includes('Erro ao carregar o anúncio')) {
      throw new Error('Mensagem de erro não apresentada para anúncio inexistente');
    }

    console.log('Teste da página de detalhe do anúncio passou!');
  } catch (err) {
    console.error('Teste da página de detalhe do anúncio falhou:', err);
  } finally {
    await driver.quit();
  }
})();