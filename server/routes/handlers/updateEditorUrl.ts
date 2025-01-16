import db from '../../models';

async function updateEditorUrl(req, res) {
  try {
    const experimentId = req.params.id;
    const { editor_url } = req.body;

    if (!editor_url) {
      return res.status(400).json({ error: 'Editor URL is required' });
    }

    const [updatedCount] = await db.Experiment.update(
      { editor_url },
      { where: { id: experimentId } },
    );

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating editor URL:', error);
    res.status(500).json({ error: 'Failed to update editor URL' });
  }
}

export default updateEditorUrl;
