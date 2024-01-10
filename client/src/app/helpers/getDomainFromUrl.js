function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    // Include the port in the return statement
    return `${urlObj.protocol}//${urlObj.hostname}${
      urlObj.port ? `:${urlObj.port}` : ''
    }`;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

export default getDomainFromUrl;
