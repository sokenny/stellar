import db from '../../models';
import sendEmail from '../../services/sendEmail';

async function createAccountSocial(req, res) {
  const user = req.body;

  const transaction = await db.sequelize.transaction();

  try {
    const existingUser = await db.User.findOne(
      { where: { email: user.email } },
      { transaction },
    );

    if (existingUser) {
      await transaction.rollback();
      return res.status(401).json({ error: 'User already exists' });
    }

    const newUser = await db.User.create(
      {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      { transaction },
    );

    sendWelcomeEmail(newUser);

    await transaction.commit();

    res.status(200).json({ user: newUser });
  } catch (error) {
    await transaction.rollback();
    console.error('Failed to create user and API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// TODO-p1-1: Make this a service and call it also on confirm email
async function sendWelcomeEmail(newUser) {
  const html = `
    <p>Welcome to Stellar AB Testing${
      newUser.first_name ? `, ${newUser.first_name}` : ''
    }!</p>
    <p>You can now start increasing your conversion rates by creating new experiments with our platform.</p>
    <p>Don't have a clear idea on what to test? Start by making text variations of your main elements! Such as your h1 or CTA. Plenty of CR potential is usually locked inside simple tweaks of this nature.</p>
    <p>Feel free to reach to us at <b>hello@gostellar.app</b> if you need any help getting set up :)</p>
  `;

  await sendEmail({
    recipients: [{ email: newUser.email }],
    subject: 'Welcome to Stellar AB Testing!',
    html,
  });
}

export default createAccountSocial;
