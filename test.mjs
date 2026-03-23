import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
      // ignore normal logs or network errors to reduce noise
      if (msg.type() === 'error') {
          console.log('PAGE CONSOLE ERROR:', msg.text());
      }
  });
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 1000));
      
      // Click through navbar
      console.log('Clicking Nexus Explorer...');
      await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Nexus Explorer'));
          if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 1000));

      console.log('Clicking Knowledge Vault...');
      await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Knowledge Vault'));
          if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 1000));

      console.log('Clicking Collab Room...');
      await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Collab Room'));
          if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 1000));

      console.log('Clicking Admin Oversight...');
      await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Admin Oversight'));
          if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
      
      console.log('Finished test.');

  } catch (e) {
      console.error(e);
  } finally {
      await browser.close();
  }
})();
