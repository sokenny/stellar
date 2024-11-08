import db from '../../models';

async function handleConfirmEmail(req, res) {
  const { token } = req.query;

  try {
    const user = await db.User.findOne({
      where: { confirmation_token: token },
    });

    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }

    user.confirmed_at = new Date();
    await user.save();

    res.redirect(`${process.env.STELLAR_CLIENT_URL}/login?success=true`);
  } catch (error) {
    console.error('Error confirming account:', error);
    res.status(500).send('Internal server error');
  }
}

export default handleConfirmEmail;
