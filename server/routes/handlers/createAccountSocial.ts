import db from '../../models';
import sendWelcomeEmail from '../../services/sendWelcomeEmail';

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

export default createAccountSocial;
