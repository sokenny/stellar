import { invalidateCache } from '../../helpers/cache';
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
  await invalidateCache(`experiments:${projectId}`);
  const browser = await puppeteer.launch({
    args: ['--disable-logging'],
  });
  const browserPage = await browser.newPage();
  await browserPage.goto(`${url}?stellarMode=true&checkingSnippet=true`);

  console.log('Page loaded, checking for snippet request...');

  // Poll for the snippet_status in the database every second, with a max of 10 attempts (10 seconds)
  const maxAttempts = 10;
  let attempts = 0;

  return new Promise(async (resolve, reject) => {
    const interval = setInterval(async () => {
      attempts += 1;

      try {
        const project = await db.Project.findOne({
          where: { id: projectId },
          attributes: ['snippet_status'],
        });

        if (project && project.snippet_status === 1) {
          clearInterval(interval);
          await browser.close();
          resolve(void 0); // Snippet was detected successfully
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          await browser.close();
          reject(new Error('Snippet not detected within the expected time.'));
        }
      } catch (error) {
        clearInterval(interval);
        await browser.close();
        reject(new Error('Error checking snippet status.'));
      }
    }, 1000); // Check every 1 second
  });
}

export default checkSnippet;
