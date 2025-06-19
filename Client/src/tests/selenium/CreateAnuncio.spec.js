import { Builder, By, until } from 'selenium-webdriver';

// Função utilitária para cooldown/espera entre passos
function cooldown(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function criarAnuncioTest() {
  let driver;
  try {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    console.log('Iniciando teste de criação de anúncio...');

    // Aceder à página de login
    await driver.get('http://localhost:5173/login');
    console.log('Página de login carregada.');
    await cooldown(1000);

    // Preencher credenciais
    await driver.findElement(By.id('email')).sendKeys('3@gmail.com');
    await driver.findElement(By.id('password')).sendKeys('123');
    console.log('Credenciais inseridas.');
    await cooldown(1000);

    // Submeter formulário de login
    await driver.findElement(By.css('button[type="submit"]')).click();
    console.log('Login submetido.');
    await cooldown(1000);

    // Esperar redirecionamento para página inicial
    await driver.wait(until.urlIs('http://localhost:5173/?page=1'), 10000);
    console.log('Login bem-sucedido, redirecionado para página inicial.');
    await cooldown(1000);

    // Clicar no botão de perfil
    const perfilBotao = await driver.wait(
      until.elementLocated(By.css('.d-flex.align-items-center.cursor-pointer')),
      10000
    );
    await driver.wait(until.elementIsVisible(perfilBotao), 10000);
    await perfilBotao.click();
    console.log('Botão de perfil clicado.');
    await cooldown(1000);

    // Esperar e clicar em "Meu Perfil" no dropdown
    const meuPerfilItem = await driver.wait(
      until.elementLocated(By.xpath("//a[contains(@class, 'dropdown-item') and contains(., 'Meu Perfil')]")),
      10000
    );
    await driver.wait(until.elementIsVisible(meuPerfilItem), 10000);
    await meuPerfilItem.click();
    console.log('"Meu Perfil" selecionado no menu.');
    await cooldown(1000);

    // Esperar e clicar no botão "Meus Anúncios" na sidebar do perfil
    const meusAnunciosLink = await driver.wait(
      until.elementLocated(By.css('a[href="/user/anuncios"].nav-item')),
      10000
    );
    await driver.wait(until.elementIsVisible(meusAnunciosLink), 10000);
    await meusAnunciosLink.click();
    console.log('"Meus Anúncios" clicado na sidebar.');
    await cooldown(1000);


    // Clicar no botão criar anúncio
    const criarAnuncioBtn = await driver.wait(
      until.elementLocated(By.css('button.btn.btn-primary')),
      10000
    );
    await driver.wait(until.elementIsVisible(criarAnuncioBtn), 10000);
    await criarAnuncioBtn.click();
    console.log('Botão "Criar Anúncio" clicado.');
    await cooldown(1000);

    // Preencher o formulário de criação de anúncio
    await driver.findElement(By.id('nome')).sendKeys('Pão Caseiro');
    await cooldown(300);
    await driver.findElement(By.id('descricao')).sendKeys('Pão fresco feito hoje.');
    await cooldown(300);
    await driver.findElement(By.id('preco')).sendKeys('2.50');
    await cooldown(300);
    await driver.findElement(By.id('quantidade')).sendKeys('3');
    await cooldown(300);
    await driver.findElement(By.id('localRecolha')).sendKeys('Rua das Flores, 10');
    await cooldown(300);
    await driver.findElement(By.id('horarioRecolha')).sendKeys('15:00');
    await cooldown(300);
    await driver.findElement(By.id('dataRecolha')).sendKeys('2025-06-20');
    await cooldown(300);
    await driver.findElement(By.id('dataValidade')).sendKeys('2025-07-1');
    await cooldown(300);
    await driver.findElement(By.id('categoria')).sendKeys('Padaria');
    await cooldown(300);
    // Para imagem, usar sendKeys com o caminho do ficheiro local
    await driver.findElement(By.id('imagem')).sendKeys('C:\Users\Utilizador\OneDrive - Instituto Politécnico do Porto\Discord Fotos\pao.jpg');
    await cooldown(500);
    await driver.findElement(By.css('button[type="submit"]')).click();

    console.log('Teste concluído com sucesso: Acedeu ao perfil do utilizador.');
  } catch (error) {
    console.error('Erro durante o teste:', error);
  } finally {
    if (driver) {
      await driver.quit();
      console.log('Driver encerrado.');
    }
  }
}

criarAnuncioTest();
