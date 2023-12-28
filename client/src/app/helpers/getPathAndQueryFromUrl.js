function getPathAndQueryFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

export default getPathAndQueryFromUrl;
