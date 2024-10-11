import db from '../../models';
import sendEmail from '../../services/sendEmail';

async function createAccount(req, res) {
  const user = req.body;

  const transaction = await db.sequelize.transaction(); // Start a new transaction

  try {
    const existingUser = await db.User.findOne(
      { where: { email: user.email } },
      { transaction },
    );

    if (existingUser) {
      await transaction.rollback(); // Rollback the transaction if user exists
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

    await transaction.commit(); // Commit the transaction if all operations succeed

    res.status(200).json({ user: newUser });
  } catch (error) {
    await transaction.rollback(); // Rollback the transaction in case of an error
    console.error('Failed to create user and API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function sendWelcomeEmail(newUser) {
  const html = `
    <p>Welcome to Stellar AB Testing${
      newUser.first_name ? `, ${newUser.first_name}` : ''
    }!</p>
    <p>Your account has been successfully created.</p>
    <p>Feel free to reach to us at <b>hello@gostellar.app</b> if you need any help getting set up :)</p>
  `;

  await sendEmail({
    recipients: [{ email: newUser.email }],
    subject: 'Welcome to Stellar AB Testing!',
    html,
  });
}

export default createAccount;
