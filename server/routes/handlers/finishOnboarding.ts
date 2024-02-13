import db from '../../models';

async function finishOnboarding(req, res) {
  const { projectId } = req.params;
  const { userEmail } = req.body;

  const user = await db.User.findOne({ where: { email: userEmail } });

  await db.Project.update({ user_id: user.id }, { where: { id: projectId } });

  res.json({ success: true });
}

export default finishOnboarding;
