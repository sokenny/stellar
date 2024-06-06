import path from 'path';

async function applyStyle(elementHandle, styleObject) {
  if (elementHandle) {
    await elementHandle.evaluate((el, style) => {
      Object.assign(el.style, style);
    }, styleObject);
  }
}

async function highlightAndCapture(
  session,
  selector: string,
  fileName: string,
) {
  const { page } = session;
  const dir = path.join(__dirname, '..', 'public', 'snapshots');
  console.log('dir!!:', dir);

  // Attempt to find the element using the passed selector
  // Select element from selector
  const element = await page.$(selector);
  if (!element) {
    throw new Error(
      `Element with selector "${selector}" not found on the page.`,
    );
  }

  const highlightStyle = {
    border: '2px solid red',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  };

  await applyStyle(element, highlightStyle);

  const viewport = await page.viewport();
  const destination = path.join(dir, fileName);

  await page.screenshot({
    path: destination,
    clip: {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    },
  });

  return destination;
}

export default highlightAndCapture;
