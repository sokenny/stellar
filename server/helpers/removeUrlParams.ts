function removeUrlParams(urlString) {
  try {
    const url = new URL(urlString);
    url.search = '';
    return url.href;
  } catch (error) {
    console.error('Invalid URL:', error);
    return urlString;
  }
}

export default removeUrlParams;
