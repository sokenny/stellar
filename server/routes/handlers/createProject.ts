import { invalidateCache } from '../../helpers/cache';
import { generateApiKey } from '../../helpers/crypto';
import normalizeUrl from '../../helpers/normalizeUrl';
import db from '../../models';

async function createProject(req, res) {
  const { domain } = req.body;
  const userId = req.user.id;
  // const domain = normalizeUrl(
  //   url.replace('https://', '').replace('http://', '').replace('www.', ''),
  // ).replace(/\/$/, '');

  const [project, created] = await db.Project.findOrCreate({
    where: { domain, user_id: userId },
    defaults: {
      user_id: userId,
      name: domain,
      domain,
    },
  });

  // await db.Page.create({
  //   name: url,
  //   url: url,
  //   project_id: project.id,
  //   context: '',
  // });

  if (!created) {
    return res.status(400).json({ error: 'Project already exists' });
  }

  invalidateCache('allowed-origins');

  const existingApiKey = await db.ApiKey.findOne({
    where: { project_id: project.id },
  });

  if (existingApiKey) {
    return res.json({ success: true });
  }

  const apiKey = generateApiKey(userId, project.id);

  await db.ApiKey.create({
    user_id: userId,
    project_id: project.id,
    key: apiKey,
  });

  res.json({ success: true, project });
}

export default createProject;
