import db from '../../models';
import puppeteer from 'puppeteer';

async function checkSnippet(req, res) {
  const { url } = req.body;

  // lookup page where url matches
  const page = await db.Page.findOne({ where: { url } });

  // if no page, return error
  if (!page) {
    res.status(400).json({ error: 'Page not found' });
    return;
  }

  // Go to url passing in the following params ?stellarMode=true&checkingSnippet=true
  const browser = await puppeteer.launch();
  const browserPage = await browser.newPage();
  await browserPage.goto(`${url}?stellarMode=true&checkingSnippet=true`);
  // check that element with attribute data-stellar-api-key exists
  await browserPage.waitForSelector('[data-stellar-api-key]');
  const snippet = await browserPage.evaluate(() => {
    const snippet = document.querySelector('[data-stellar-api-key]');
    return snippet ? snippet.innerHTML : null;
  });

  console.log('Snippet! ', snippet);

  // update project where id = page.project_id, set snippet_status = 1
  await db.Project.update(
    { snippet_status: 1 },
    { where: { id: page.project_id } },
  );

  // return success
  res.json({ success: true });

  console.log('Page que llega! ', url, req.body);

  // If there is snippet, update
}

export default checkSnippet;
