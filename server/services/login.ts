import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../models';

const login = async ({ email, password }) => {
  const user = await db.User.findOne({
    where: { email: email },
  });

  if (user && !user.confirmed_at) {
    throw new Error('Please confirm your email before logging in');
  }

  if (!user) {
    throw new Error('User not found');
  }

  // Verify the password using bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  if (!user.confirmed_at) {
    throw new Error('Please confirm your email first');
  }

  const token = jwt.sign(
    { email: user.email, id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );

  return { user, token };
};

export default login;
