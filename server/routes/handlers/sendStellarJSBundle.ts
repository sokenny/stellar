import fs from 'fs';
import path from 'path';
import { minify } from 'uglify-js';

const DEV_EDITOR_URL = 'http://localhost:3001/public/editorjs';
const PROD_EDITOR_URL =
  'https://d3niuqph2rteir.cloudfront.net/client_js/editor.js';

const DEV_CLIENT_EXPERIMENTS_URL =
  'http://localhost:3001/public/experiments/client';
const PROD_CLIENT_EXPERIMENTS_URL =
  'https://d3niuqph2rteir.cloudfront.net/public/experiments/client';

const DEV_STELLAR_API_URL = 'http://localhost:3001';
const PROD_STELLAR_API_URL = 'https://api.gostellar.app';
async function sendStellarJSBundle(req, res) {
  const isProd = req.query.prod === 'true';
  try {
    const stellarPath = path.join(
      __dirname,
      '../../public/client_js/stellar.js',
    );

    const stellarContent = fs.readFileSync(stellarPath, 'utf8');

    const populatedContent = stellarContent
      .replace(
        /{{STELLAR_API_URL}}/g,
        isProd ? PROD_STELLAR_API_URL : DEV_STELLAR_API_URL,
      )
      .replace(/{{EDITOR_URL}}/g, isProd ? PROD_EDITOR_URL : DEV_EDITOR_URL)
      .replace(
        /{{CLIENT_EXPERIMENTS_URL}}/g,
        isProd ? PROD_CLIENT_EXPERIMENTS_URL : DEV_CLIENT_EXPERIMENTS_URL,
      );

    const minifiedContent = minify(populatedContent).code;

    res.type('.js');
    res.send(minifiedContent);
  } catch (error) {
    console.error('Error sending stellar file:', error);
    res.status(500).send('Internal Server Error');
  }
}

export default sendStellarJSBundle;
