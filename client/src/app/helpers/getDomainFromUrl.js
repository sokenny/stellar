function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

export default getDomainFromUrl;
