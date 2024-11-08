import db from '../models';
import bcrypt from 'bcrypt';
import sendEmail from './sendEmail';
import generateToken from '../helpers/generateToken';

async function hashPassword(password) {
  const saltRounds = 10;
  if (!password) {
    throw new Error('Password is required for hashing');
  }
  console.log('Hashing password with saltRounds:', saltRounds);
  return await bcrypt.hash(password, saltRounds);
}

async function sendConfirmationEmail(newUser) {
  const html = `
      <p>Hi ${newUser.first_name},</p>
      <p>Please confirm your email address by clicking the link below:</p>
      <p><a href="${process.env.STELLAR_API_URL}/public/confirm-email?token=${newUser.confirmation_token}">Confirm Email</a></p>
      <p>If you did not create this account, please ignore this email.</p>
      <p>-Stellar Team</p>
    `;

  await sendEmail({
    recipients: [{ email: newUser.email }],
    subject: 'Please Confirm Your Email Address for Stellar AB Testing',
    html,
  });
}

async function createAccount({ firstName, lastName, email, password }) {
  console.log('password aca', password);
  try {
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }
    const hashedPassword = await hashPassword(password);
    const confirmationToken = generateToken();
    const newUser = await db.User.create({
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
      confirmation_token: confirmationToken,
    });

    await sendConfirmationEmail(newUser);

    return newUser;
  } catch (error) {
    console.error('Error in createAccount:', error);
    throw error;
  }
}

export default createAccount;
