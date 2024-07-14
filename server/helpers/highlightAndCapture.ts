import path from 'path';
import AWS from 'aws-sdk';
import fs from 'fs';

// Configure the AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

const s3 = new AWS.S3();

async function uploadToS3(filePath, bucketName, key) {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentType: 'image/png',
  };

  return s3.upload(params).promise();
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

  const s3Key = `snapshots/${fileName}`;
  await uploadToS3(destination, bucketName, s3Key);

  fs.unlinkSync(destination);

  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
}

export default highlightAndCapture;
