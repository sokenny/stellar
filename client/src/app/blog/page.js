import Link from 'next/link';
import { client } from '../../sanity/client';
import styles from './page.module.css';

export default async function BlogIndex() {
  const query = `*[_type == "post"]{ "slug": slug.current, title, publishedAt }`;
  const posts = await client.fetch(query);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Blog</h1>
      <ul className={styles.postList}>
        {posts.map((post) => (
          <li key={post.slug} className={styles.postItem}>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            <p className={styles.postDate}>
              Published on: {new Date(post.publishedAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
