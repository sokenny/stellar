import db from '../../models';
import puppeteer from 'puppeteer';

async function checkSnippet(req, res) {
  const { url } = req.body;

  try {
    const result = await Promise.race([
      performSnippetCheck(url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000),
      ),
    ]);

    // return success if no timeout and operation successful
    res.json({ success: true });
  } catch (error) {
    if (error.message === 'Timeout') {
      res.status(408).json({ error: 'Request timeout' });
    } else {
      res.status(400).json({ error: 'Page not found or other error' });
    }
  }
}

async function performSnippetCheck(url) {
  // lookup page where url matches
  const page = await db.Page.findOne({ where: { url } });

  // if no page, throw an error
  if (!page) {
    throw new Error('Page not found');
  }

  const browser = await puppeteer.launch();
  const browserPage = await browser.newPage();
  await browserPage.goto(`${url}?stellarMode=true&checkingSnippet=true`);

  // check that element with attribute data-stellar-api-key exists
  console.log('Wait will start');
  await browserPage.waitForSelector('[data-stellar-api-key]');
  const snippet = await browserPage.evaluate(() => {
    const element = document.querySelector('[data-stellar-api-key]');
    return element ? element.innerHTML : null;
  });

  console.log('Snippet! ', snippet);

  // update project where id = page.project_id, set snippet_status = 1
  await db.Project.update(
    { snippet_status: 1 },
    { where: { id: page.project_id } },
  );

  // close the browser
  await browser.close();
}

export default checkSnippet;
