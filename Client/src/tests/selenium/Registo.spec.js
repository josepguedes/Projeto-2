import { Builder, By, until } from 'selenium-webdriver';

(async function testRegister() {
  let driver = await new Builder().forBrowser('chrome').build();

  // Gera um email único para evitar conflitos de utilizador já existente
  const random = Math.floor(Math.random() * 100000);
  const nome = `Teste Selenium ${random}`;
  const email = `selenium${random}@gmail.com`;
  const password = '123456';

  try {
    await driver.get('http://localhost:5173/register');

    await driver.findElement(By.id('name')).sendKeys(nome);
    await driver.findElement(By.id('email')).sendKeys(email);
    await driver.findElement(By.id('password')).sendKeys(password);

    await driver.findElement(By.css('button[type="submit"]')).click();

    // Espera pela mensagem de sucesso
    const successElem = await driver.wait(
      until.elementLocated(By.css('p[style*="color: green"]')),
      5000
    );
    const successMsg = await successElem.getText();

    if (successMsg.includes('sucesso')) {
      console.log('Teste de registo passou!');
    } else {
      console.error('Mensagem inesperada:', successMsg);
    }
  } catch (err) {
    // Tenta capturar mensagem de erro
    try {
      const errorElem = await driver.findElement(By.css('p[style*="color: red"]'));
      const errorMsg = await errorElem.getText();
      console.error('Mensagem de erro apresentada no registo:', errorMsg);
    } catch (e) {
      // Ignora se não encontrar mensagem de erro
    }
    console.error('Teste de registo falhou:', err);
  } finally {
    await driver.quit();
  }
})();