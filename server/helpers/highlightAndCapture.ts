import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';

// TODO: Move s3 utilities into a helper or lib file
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadToS3(buffer, bucketName, key) {
  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
  };

  const upload = new Upload({
    client: s3Client,
    params: uploadParams,
  });

  return upload.done();
}

async function injectCSSClass(page, className, cssText) {
  await page.evaluate(
    (className, cssText) => {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = `.${className} { ${cssText} }`;
      document.head.appendChild(style);
    },
    className,
    cssText,
  );
}

async function applyClass(elementHandle, className) {
  if (elementHandle) {
    await elementHandle.evaluate((el, className) => {
      el.classList.add(className);
    }, className);
  }
}

async function removeClass(elementHandle, className) {
  if (elementHandle) {
    await elementHandle.evaluate((el, className) => {
      el.classList.remove(className);
    }, className);
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

  const originalStyles = await element.evaluate((node) => node.style.cssText);
  const originalText = await element.evaluate((node) => node.innerText);

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

  // Inject CSS class into the page
  const highlightClass = 'stellar__highlight';
  const highlightStyle =
    'border: 2px solid red; background-color: rgba(255, 0, 0, 0.1);';

  // Inject the CSS class into the page
  await injectCSSClass(page, highlightClass, highlightStyle);

  // Apply the CSS class to the element
  if (modifications.length === 0) {
    await applyClass(element, highlightClass);
  }

  const viewPort = await page.viewport();

  const elementDistanceFromTop = await element.evaluate((node) => {
    const { top } = node.getBoundingClientRect();
    return top;
  });

  const clipRegion = {
    x: 0,
    y:
      elementDistanceFromTop > viewPort.height / 2
        ? elementDistanceFromTop - viewPort.height / 2
        : 0,
    width: viewPort.width,
    height: viewPort.height,
  };

  const destination = path.join(dir, fileName);

  await page.screenshot({
    path: destination,
    clip: clipRegion,
  });

  if (modifications.length === 0) {
    console.log('Removing class', highlightClass);
    await removeClass(element, highlightClass);
    console.log('Class removed', highlightClass);
  }

  await element.evaluate(
    (node, originalStyles, originalText) => {
      node.style.cssText = originalStyles;
      node.innerText = originalText;
    },
    originalStyles,
    originalText,
  );

  const bucketName = 'stellar-app-bucket';

  const image = await Jimp.read(destination);
  image.resize(500, Jimp.AUTO).quality(80);
  const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

  const s3Key = `snapshots/${fileName}`;
  const s3UploadResult = await uploadToS3(buffer, bucketName, s3Key);

  fs.unlinkSync(destination);

  return s3UploadResult.Location;
}

export default highlightAndCapture;
