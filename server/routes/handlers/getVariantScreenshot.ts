import path from 'path';

function getVariantScreenshot(req, res) {
  const { id } = req.params;
  const dir = path.join(
    __dirname,
    `../../public/snapshots/experiment-${id}.png`,
  );
  res.sendFile(dir);
}

export default getVariantScreenshot;
