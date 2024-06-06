import db from '../models';

async function getAllowedOrigins() {
  // query all projects in db and bring unique projects.domains in an array
  const allowedOrigins = await db.Project.findAll({
    attributes: ['domains'],
    raw: true,
  });

  console.log('allowedOrigins: ', allowedOrigins);

  return allowedOrigins;
}

export default getAllowedOrigins;
