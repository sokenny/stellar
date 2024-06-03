import db from '../../models';
import { uuid } from 'uuidv4';

async function createAccount(req, res) {
  const user = req.body;
  console.log('usuario! jeje ', user);

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

    const apiKey = uuid();

    await db.ApiKey.create(
      {
        user_id: newUser.id,
        key: apiKey,
      },
      { transaction },
    );

    await transaction.commit(); // Commit the transaction if all operations succeed
    res.status(200).json({ user: newUser });
  } catch (error) {
    await transaction.rollback(); // Rollback the transaction in case of an error
    console.error('Failed to create user and API key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default createAccount;
