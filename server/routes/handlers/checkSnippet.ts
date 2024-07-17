import { decryptApiKey } from '../../helpers/crypto';
import db from '../../models';
import puppeteer from 'puppeteer';

async function checkSnippet(req, res) {
  const { url } = req.body;

  try {
    await Promise.race([
      performSnippetCheck(url, req.projectId),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000),
      ),
    ]);

    res.json({ success: true });
  } catch (error) {
    if (error.message === 'Timeout') {
      res.status(408).json({ error: 'Request timeout' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
}

async function performSnippetCheck(url, projectId) {
  console.log('Url que llega: ', url);
  const page = await db.Page.findOne({ where: { url, project_id: projectId } });

  if (!page) {
    throw new Error('Page not found');
  }

  const browser = await puppeteer.launch({
    args: ['--disable-logging'],
  });
  const browserPage = await browser.newPage();
  await browserPage.goto(`${url}?stellarMode=true&checkingSnippet=true`);

  console.log('Wait will start');
  await browserPage.waitForSelector('[data-stellar-api-key]');
  console.log('Wait is over');

  const apiKey = await browserPage.evaluate(() => {
    const element = document.querySelector('[data-stellar-api-key]');
    return element ? element.getAttribute('data-stellar-api-key') : null;
  });

  const decyptedKey = decryptApiKey(apiKey);

  if (!decyptedKey) {
    console.log('no decyptedKey');
    throw new Error('The snippet found is not valid');
  }

  if (decyptedKey.projectId !== projectId) {
    console.log('projectId no coincide', decyptedKey, projectId);
    throw new Error('The snippet found is not valid');
  }

  await db.Project.update(
    { snippet_status: 1 },
    { where: { id: page.project_id } },
  );

  await browser.close();
}

export default checkSnippet;
