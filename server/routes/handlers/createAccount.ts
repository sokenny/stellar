import removeUrlParams from '../../helpers/removeUrlParams';
import db from '../../models';
import createVariantsFromElement from '../../services/createVariantsFromElement';

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

  res.status(200).json({ user: newUser });
}

export default createAccount;
