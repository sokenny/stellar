import fs from 'fs';
import path from 'path';

async function sendStellarJSBundle(req, res) {
  try {
    const stellarPath = path.join(__dirname, '../public/client_js/stellar.js');
    const editorPath = path.join(__dirname, '../public/client_js/editor.js');

    const stellarContent = fs.readFileSync(stellarPath, 'utf8');
    const editorContent = fs.readFileSync(editorPath, 'utf8');

    res.type('.js');
    // res.send(stellarContent + '\n' + editorContent);
    res.send(editorContent);
  } catch (error) {
    console.error('Error sending files:', error);
    res.status(500).send('Internal Server Error');
  }
}

export default sendStellarJSBundle;
