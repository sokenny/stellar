async function getExperiments(req, res) {
  // read page sent in url query
  const { page } = req.query;
  console.log('Page: ', page);

  // read authorization bearer
  const { authorization } = req.headers;
  console.log('Authorization: ', authorization);

  return res.json({ message: 'Hello World', page, authorization });
}

export default getExperiments;
