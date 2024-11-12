import bcrypt from 'bcrypt';
import db from '../models';

const login = async ({ email, password }) => {
  const user = await db.User.findOne({
    where: { email: email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.password) {
    throw new Error('User used social login');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return { user };
};

export default login;
