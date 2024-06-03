import db from '../../models';

async function finishOnboarding(req, res) {
  const { projectId } = req.params;
  const { userEmail } = req.body;

  const user = await db.User.findOne({ where: { email: userEmail } });

  // if not user found, return error
  if (!user) {
    console.log('no encontramos el usr!');
    return res.status(404).json({ error: 'User not found' });
  }

  await db.Project.update({ user_id: user.id }, { where: { id: projectId } });

  res.json({ success: true });
}

export default finishOnboarding;
