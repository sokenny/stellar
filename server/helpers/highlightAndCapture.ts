import path from 'path';

async function applyStyle(elementHandle, styleObject) {
  if (elementHandle) {
    await elementHandle.evaluate((el, style) => {
      Object.assign(el.style, style);
    }, styleObject);
  }
}

async function highlightAndCapture(browserSession, mainElements, fileName) {
  const { page } = browserSession;
  const dir = path.join(__dirname, '..', 'public', 'snapshots');
  console.log('dir!!:', dir);

  const highlightStyle = {
    border: '2px solid red',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  };

  if (mainElements.h1[0]) {
    await applyStyle(mainElements.h1[0], highlightStyle);
  }
  if (mainElements.description[0]) {
    await applyStyle(mainElements.description[0], highlightStyle);
  }
  if (mainElements.cta[0]) {
    await applyStyle(mainElements.cta[0], highlightStyle);
  }

  const viewport = await page.viewport();

  await page.screenshot({
    path: path.join(dir, fileName),
    clip: {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    },
  });
}

export default highlightAndCapture;
