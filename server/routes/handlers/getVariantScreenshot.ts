import path from 'path';

function getPath({ experimentId, variantId }) {
  if (variantId) {
    return `../../public/snapshots/experiment-${experimentId}var${variantId}.png`;
  }
  return `../../public/snapshots/experiment-${experimentId}.png`;
}

function getVariantScreenshot(req, res) {
  const { id, variantId } = req.params;
  const dir = path.join(
    __dirname,
    getPath({
      experimentId: id,
      variantId,
    }),
  );
  res.sendFile(dir);
}

export default getVariantScreenshot;
