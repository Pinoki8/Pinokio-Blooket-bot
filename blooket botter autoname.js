const { chromium } = require('playwright');
const readline = require('readline');

console.log(String.raw`
  	    ▄▄                                 ▄▄           
▀███▀▀▀██▄  ██                     ▀███        ██           
  ██   ▀██▄                          ██                     
  ██   ▄██▀███ ▀████████▄   ▄██▀██▄  ██  ▄██▀▀███   ▄██▀██▄ 
  ███████   ██   ██    ██  ██▀   ▀██ ██ ▄█     ██  ██▀   ▀██
  ██        ██   ██    ██  ██     ██ ██▄██     ██  ██     ██
  ██        ██   ██    ██  ██▄   ▄██ ██ ▀██▄   ██  ██▄   ▄██
▄████▄    ▄████▄████  ████▄ ▀█████▀▄████▄ ██▄▄████▄ ▀█████▀ 

  ▄▄          ▄▄                                                 ▄▄                       
 ▄██        ▀███                   ▀███                ██       ▄██                  ██   
  ██          ██                     ██                ██        ██                  ██   
  ██▄████▄    ██   ▄██▀██▄  ▄██▀██▄  ██  ▄██▀  ▄▄█▀████████      ██▄████▄   ▄██▀██▄██████ 
  ██    ▀██   ██  ██▀   ▀████▀   ▀██ ██ ▄█    ▄█▀   ██ ██        ██    ▀██ ██▀   ▀██ ██   
  ██     ██   ██  ██     ████     ██ ██▄██    ██▀▀▀▀▀▀ ██        ██     ██ ██     ██ ██   
  ██▄   ▄██   ██  ██▄   ▄████▄   ▄██ ██ ▀██▄  ██▄    ▄ ██        ██▄   ▄██ ██▄   ▄██ ██   
  █▀█████▀  ▄████▄ ▀█████▀  ▀█████▀▄████▄ ██▄▄ ▀█████▀ ▀████     █▀█████▀   ▀█████▀  ▀████
`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(q) {
  return new Promise(resolve => rl.question(q, resolve));
}

(async () => {
  const gameCode = await ask("Enter Blooket game code (5-8 digits): ");
  let botCount = parseInt(await ask("Enter number of bots (1-100): "));
  if (botCount < 1 || botCount > 100) botCount = 1;
  rl.close();

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const pages = [];

  for (let i = 0; i < botCount; i++) {
    const page = await context.newPage();
    pages.push(page);
    await page.goto(`https://play.blooket.com/play?id=${gameCode}`);
  }

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    let consecutiveClicks = 0;
    let joinedGame = false;

    (async function autoClick() {
      try {
        const joinButton = await page.$('div[type="submit"][role="button"][class*="_joinButton_"][tabindex="0"]');
        if (joinButton) {
          await joinButton.click();
          consecutiveClicks++;
        }
      } catch (e) {}

      if (consecutiveClicks > 5 && !joinedGame) {
        try {
          const joinButton = await page.$('div[type="submit"][role="button"][class*="_joinButton_"][tabindex="0"]');
          if (!joinButton) {
            joinedGame = true;
            console.log(` Bot #${i + 1} joined the game! (Game ID: ${gameCode}) 🚀`);
          }
        } catch (e) {}
      }

      setTimeout(autoClick, 200);
    })();
  }
})();
