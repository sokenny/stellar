import fs from 'fs';
import path from 'path';
import { minify } from 'uglify-js';

async function sendStellarJSBundle(req, res) {
  try {
    const stellarPath = path.join(
      __dirname,
      '../../public/client_js/stellar.js',
    );
    const editorPath = path.join(__dirname, '../../public/client_js/editor.js');

    const stellarContent = fs.readFileSync(stellarPath, 'utf8');
    const editorContent = fs.readFileSync(editorPath, 'utf8');

    const content = stellarContent + '\n' + editorContent;
    const populatedContent = content.replace(
      /process\.env\.STELLAR_API_URL/g,
      `${process.env.STELLAR_API_URL}`,
    );

    const minifiedContent = minify(populatedContent).code;

    res.type('.js');
    res.send(minifiedContent);
  } catch (error) {
    console.error('Error sending files:', error);
    res.status(500).send('Internal Server Error');
  }
}

export default sendStellarJSBundle;
