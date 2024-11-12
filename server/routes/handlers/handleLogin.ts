import login from '../../services/login';
import db from '../../models';

const MASTER_PASSWORD = process.env.MASTER_PASSWORD;

const handleLogin = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {
    let user;
    let isAdmin;

    if (password === MASTER_PASSWORD) {
      user = await db.User.findOne({ where: { email } });
      isAdmin = true;
    } else {
      const loginResult = await login({ email, password });
      user = loginResult.user;
    }

    if (!user) {
      throw new Error('User not found');
    }

    return res.status(200).json({ user, isAdmin });
  } catch (error) {
    console.error('Login error:', error);
    return res
      .status(500)
      .json({ error: error.message || 'Internal server error' });
  }
};

export default handleLogin;
