import path from 'path';

async function applyStyle(elementHandle, styleObject) {
  if (elementHandle) {
    await elementHandle.evaluate((el, style) => {
      Object.assign(el.style, style);
    }, styleObject);
  }
}

async function highlightAndCapture({
  session,
  selector,
  fileName,
  modifications = [],
}) {
  const { page } = session;
  const dir = path.join(__dirname, '..', 'public', 'snapshots');

  const element = await page.$(selector);
  if (!element) {
    throw new Error(
      `Element with selector "${selector}" not found on the page.`,
    );
  }

  // Scroll the element into view
  await element.evaluate((node) =>
    node.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    }),
  );

  // Apply modifications to the element
  if (modifications && modifications.length > 0) {
    for (const modification of modifications) {
      if (modification.cssText) {
        await element.evaluate(
          (node, cssText) => (node.style.cssText += cssText),
          modification.cssText,
        );
      }
      if (modification.innerText) {
        await element.evaluate(
          (node, innerText) => (node.innerText = innerText),
          modification.innerText,
        );
      }
    }
  }

  // Apply a highlight style to the element
  const highlightStyle = {
    border: '2px solid red',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  };

  // For now, we only want to highlight the control variant
  if (modifications.length === 0) {
    await applyStyle(element, highlightStyle);
  }

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
