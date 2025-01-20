function isValidUrl(url) {
  try {
    if (url.includes(' ')) {
      return false;
    }
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

export default isValidUrl;
