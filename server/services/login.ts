import bcrypt from 'bcrypt';
import db from '../models';

const login = async ({ email, password }) => {
  const user = await db.User.findOne({
    where: { email: email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return { user };
};

export default login;
