import { Builder, By, until } from 'selenium-webdriver';

(async function testLogin() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        console.log('Abrindo página de login...');
        await driver.get('http://localhost:5173/login');

        console.log('Preenchendo campo de email...');
        await driver.findElement(By.id('email')).sendKeys('3@gmail.com');

        console.log('Preenchendo campo de senha...');
        await driver.findElement(By.id('password')).sendKeys('123');

        console.log('Clicando no botão de login...');
        await driver.findElement(By.css('button[type="submit"]')).click();

        console.log('Aguardando elemento da página inicial...');
        // Aguarda até que um elemento específico da página inicial esteja visível (ajuste o seletor conforme necessário)
        await driver.wait(until.elementLocated(By.css('nav')), 10000);

        console.log('Teste de login passou!');
    } catch (err) {
        console.error('Teste de login falhou:', err);
    } finally {
        console.log('Fechando o navegador...');
        await driver.quit();
    }
})();