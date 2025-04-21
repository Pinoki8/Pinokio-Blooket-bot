const { chromium } = require('playwright');
const readline = require('readline');
const crypto = require('crypto');

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
  const baseName = await ask("Enter base nickname for the bots: ");
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
    const nickname = baseName + " " + crypto.randomBytes(3).toString('hex');
    let consecutiveFailures = 0;
    let joinedGame = false;

    (async function keepLooking() {
      let foundInput = false;
      let foundButton = false;

      try {
        const inputSelector = await page.$('input[placeholder="Nickname"]');
        if (inputSelector) {
          await page.fill('input[placeholder="Nickname"]', nickname);
          foundInput = true;
        }
      } catch (e) {}

      try {
        const joinButton = await page.$('div[role="button"]');
        if (joinButton) {
          await joinButton.click();
          foundButton = true;
        }
      } catch (e) {}

      // If we couldn't find either element, increment failure counter
      if (!foundInput && !foundButton) {
        consecutiveFailures++;
      } else {
        consecutiveFailures = 0;
      }

      // After several consecutive failures, we assume the bot has joined
      if (consecutiveFailures > 10 && !joinedGame) {
        joinedGame = true;
        console.log(`🎮 Bot #${i + 1} joined the game! (Game ID: ${gameCode}) 🚀`);
      }

      setTimeout(keepLooking, 200);
    })();
  }
})();