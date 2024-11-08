import createAccount from '../../services/createAccount';

async function handleCreateAccount(req, res) {
  const { firstName, lastName, email, password } = req.body;

  try {
    const newUser = await createAccount({
      firstName,
      lastName,
      email,
      password,
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: error.message });
  }
}

export default handleCreateAccount;
