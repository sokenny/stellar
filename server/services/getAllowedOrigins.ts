import db from '../models';

const staticAllowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
];

async function getAllowedOrigins() {
  // query all projects in db and bring unique projects.domains in an array
  const allowedOriginsQuery = await db.Project.findAll({
    attributes: ['domain'],
    raw: true,
  });

  const allowedOrigins = allowedOriginsQuery.map((item) => item.domain);

  const allowedOriginsWithHttp = allowedOrigins.map(
    (domain) => `http://${domain}`,
  );
  const allowedOriginsWithHttps = allowedOrigins.map(
    (domain) => `https://${domain}`,
  );
  const allAllowedOrigins = [
    ...staticAllowedOrigins,
    ...allowedOriginsWithHttp,
    ...allowedOriginsWithHttps,
  ];

  return allAllowedOrigins;
}

export default getAllowedOrigins;
