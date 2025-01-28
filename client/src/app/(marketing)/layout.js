import { Poppins } from 'next/font/google';
import { Providers } from '../providers';
import Nav from '../components/Nav/Nav';
import '../globals.css';
import getAuthTokenName from '../helpers/getAuthTokenName';
import { cookies, headers } from 'next/headers';
import styles from './layout.module.css';
import { GoogleTagManager } from '@next/third-parties/google';
import Script from 'next/script';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
});

export const metadata = {
  title: 'Stellar | A/B Test Any Website',
  description: 'Fastes on the market | Loved by CRO marketers',
  // layoutSegments: ['workspace'],
};

export default function MarketingLayout({ children }) {
  const nextCookies = cookies();
  const nextAuthSessionToken = nextCookies.get(getAuthTokenName());
  const headersList = headers();
  const fullUrl = headersList.get('referer') || '';
  const path = fullUrl ? new URL(fullUrl).pathname : '';

  return <div className={styles.pageContent}>{children}</div>;
}
