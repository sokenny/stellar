import fs from 'fs';
import path from 'path';
import { minify } from 'uglify-js';

async function sendEditorJSBundle(req, res) {
  try {
    const editorPath = path.join(__dirname, '../../public/client_js/editor.js');
    const editorContent = fs.readFileSync(editorPath, 'utf8');

    const populatedContent = editorContent.replace(
      /process\.env\.STELLAR_API_URL/g,
      `${process.env.STELLAR_API_URL}`,
    );

    const minifiedContent = minify(populatedContent).code;

    res.type('.js');
    res.send(minifiedContent);
  } catch (error) {
    console.error('Error sending editor file:', error);
    res.status(500).send('Internal Server Error');
  }
}

export default sendEditorJSBundle;
