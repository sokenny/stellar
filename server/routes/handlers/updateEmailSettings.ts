import db from '../../models';

async function updateEmailSettings(req, res) {
  const { emailSettings } = req.body;
  const userId = req.user.id; // Assuming user ID is available in the request

  try {
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.email_settings = emailSettings;
    await user.save();

    res.json({ success: true, emailSettings: user.email_settings });
  } catch (error) {
    console.error('Error updating email settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default updateEmailSettings;
