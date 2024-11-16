const { createClient } = require('next-sanity');

const client = createClient({
  projectId: 'ogyvu1t5',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function fetchBlogSlugs() {
  const query = `*[_type == "post"]{ "slug": slug.current }`;
  const posts = await client.fetch(query);
  return posts.map((post) => post.slug);
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://gostellar.app',
  generateRobotsTxt: true,
  exclude: [],
  // Additional paths to include
  additionalPaths: async (config) => {
    const blogSlugs = await fetchBlogSlugs(); // Function to fetch blog slugs
    const blogPaths = blogSlugs.map((slug) => ({
      loc: `/blog/${slug}`,
      lastmod: new Date().toISOString(),
    }));

    // Add additional static paths
    const staticPaths = [
      { loc: '/', lastmod: new Date().toISOString() },
      { loc: '/signup', lastmod: new Date().toISOString() },
      { loc: '/login', lastmod: new Date().toISOString() },
    ];

    return [...blogPaths, ...staticPaths];
  },
};
