import db from '../../models';

async function createAccount(req, res) {
  // get user from body
  const user = req.body;
  console.log('usuario! jeje ', user);

  // create user with User model
  const newUser = await db.User.create({
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  });

  // TODO-p1: create api key for user. Use transaction for these operations

  res.status(200).json({ user: newUser });
}

export default createAccount;
