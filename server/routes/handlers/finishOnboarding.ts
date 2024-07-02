import { generateApiKey } from '../../helpers/crypto';
import db from '../../models';

async function finishOnboarding(req, res) {
  const { projectId } = req.params;
  const { userEmail } = req.body;
  const user = await db.User.findOne({ where: { email: userEmail } });

  if (!user) {
    console.log('no encontramos el usr!');
    return res.status(404).json({ error: 'User not found' });
  }

  const jsonUser = user.toJSON();

  await db.Project.update(
    { user_id: jsonUser.id },
    { where: { id: projectId } },
  );

  const existingApiKey = await db.ApiKey.findOne({
    where: { project_id: projectId },
  });

  if (existingApiKey) {
    return res.json({ success: true });
  }

  const apiKey = generateApiKey(jsonUser.id, projectId);

  await db.ApiKey.create({
    user_id: jsonUser.id,
    project_id: projectId,
    key: apiKey,
  });

  res.json({ success: true });
}

export default finishOnboarding;
