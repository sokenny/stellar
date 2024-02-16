import db from '../../models';

async function createAccount(req, res) {
  // get user from body
  const user = req.body;
  console.log('usuario! jeje ', user);

  const existingUser = await db.User.findOne({ where: { email: user.email } });

  if (existingUser) {
    return res.status(401).json({ error: 'User already exists' });
  }

  const newUser = await db.User.create({
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  });

  res.status(200).json({ user: newUser });
}

export default createAccount;
