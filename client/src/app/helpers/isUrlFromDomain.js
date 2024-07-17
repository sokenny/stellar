function isUrlFromDomain(url, domain) {
  if (process.env.NODE_ENV === 'development' && url.includes('localhost')) {
    return true;
  }
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    if (hostname === domain || hostname.endsWith('.' + domain)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Invalid URL:', error);
    return false;
  }
}

export default isUrlFromDomain;
