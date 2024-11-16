import { client } from '../../sanity/client';

async function fetchBlogSlugs() {
  const query = `*[_type == "post"]{ "slug": slug.current }`;
  const posts = await client.fetch(query);
  return posts.map((post) => post.slug);
}

export default fetchBlogSlugs;
