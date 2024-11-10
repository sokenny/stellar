import login from '../../services/login';

const handleLogin = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {
    const { user } = await login({
      email,
      password,
    });

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Login error:', error);
    return res
      .status(500)
      .json({ error: error.message || 'Internal server error' });
  }
};

export default handleLogin;
