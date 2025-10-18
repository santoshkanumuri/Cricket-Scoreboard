const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/score1.html');

    // Fill out the setup form
    await page.fill('#team1', 'Team A');
    await page.fill('#team2', 'Team B');

    for (let i = 1; i <= 11; i++) {
        await page.fill(`#player${i}team1`, `Player A${i}`);
        await page.fill(`#player${i}team2`, `Player B${i}`);
    }

    await page.fill('#overs', '5');
    await page.fill('#toss1', 'heads');
    await page.fill('#toss2', 'tails');
    await page.fill('#choice', 'bat');
    await page.fill('#first-bowler', 'Player B1');

    await page.click('button.btn');

    // Check if the game section is visible
    const gameSectionVisible = await page.isVisible('.game-section');
    console.log(`Game section visible: ${gameSectionVisible}`);

    await browser.close();
})();
