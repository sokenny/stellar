import { PortableText } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '../../../sanity/client';
import Link from 'next/link';
import CTA from './CTA';
import styles from './page.module.css';

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

const { projectId, dataset } = client.config();
const urlFor = (source) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 3600 } };

const PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const imageUrl = urlFor(value)?.width(550).url();
      return imageUrl ? (
        <img src={imageUrl} alt={value.alt || 'Image'} />
      ) : null;
    },
  },
};

export default async function PostPage({ params }) {
  const post = await client.fetch(POST_QUERY, params, options);
  const postImageUrl = post.image
    ? urlFor(post.image)?.width(550).height(310).url()
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <CTA />
      </div>
      <main
        className={`container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4 ${styles.main}`}
      >
        <Link href="/dashboard" className="hover:underline">
          ← Back to App
        </Link>
        {postImageUrl && (
          <img
            src={postImageUrl}
            alt={post.title}
            className="aspect-video rounded-xl"
            width="550"
            height="310"
          />
        )}
        <h1 className="text-4xl mb-8">{post.title}</h1>
        <div className="prose">
          {Array.isArray(post.body) && (
            <PortableText
              value={post.body}
              components={PortableTextComponents}
            />
          )}
        </div>
        <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
      </main>
    </div>
  );
}
