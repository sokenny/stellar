import { getElementModification } from '../../services/gpt/getElementVariants';

async function getElementModificationHandler(req, res) {
  const { prompt, elementHTML, elementStyles } = req.body;

  if (!prompt || !elementHTML) {
    return res.status(400).json({
      error: 'Missing required parameters',
    });
  }

  try {
    const modifications = await getElementModification({
      prompt,
      elementHTML,
      elementStyles,
    });

    if (modifications.error) {
      return res.status(400).json(modifications);
    }

    res.json(modifications);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate modification',
      details: error.message,
    });
  }
}

export default getElementModificationHandler;
