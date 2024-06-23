import path from 'path';

async function applyStyle(elementHandle, styleObject) {
  if (elementHandle) {
    await elementHandle.evaluate((el, style) => {
      Object.assign(el.style, style);
    }, styleObject);
  }
}

async function highlightAndCapture({ session, selector, fileName }) {
  const { page } = session;
  const dir = path.join(__dirname, '..', 'public', 'snapshots');
  console.log('dir!!:', dir);

  const element = await page.$(selector);
  if (!element) {
    throw new Error(
      `Element with selector "${selector}" not found on the page.`,
    );
  }

  await element.evaluate((node) =>
    node.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    }),
  );

  const highlightStyle = {
    border: '2px solid red',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  };
  await applyStyle(element, highlightStyle);

  const boundingBox = await element.boundingBox();
  if (!boundingBox) {
    throw new Error('Failed to calculate the bounding box of the element.');
  }

  const padding = 200;
  const clipRegion = {
    x: Math.max(0, boundingBox.x - padding),
    y: Math.max(0, boundingBox.y - padding),
    width: boundingBox.width + 2 * padding,
    height: boundingBox.height + 2 * padding,
  };

  const destination = path.join(dir, fileName);

  await page.screenshot({
    path: destination,
    clip: clipRegion,
  });

  return destination;
}

export default highlightAndCapture;
