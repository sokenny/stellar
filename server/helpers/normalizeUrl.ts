function normalizeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.protocol}//${parsedUrl.hostname}${
      parsedUrl.port ? ':' + parsedUrl.port : ''
    }`;
  } catch (e) {
    return url;
  }
}

export default normalizeUrl;
