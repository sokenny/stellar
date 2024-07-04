function interceptFetch(projectId, token) {
  console.log('Intercept called! ', projectId, token);
  const originalFetch = fetch;

  window.fetch = function (url, options = {}) {
    const customHeaders = {
      'project-id': projectId,
      'Authorization': `Bearer ${token}`,
    };

    if (options.headers) {
      options.headers = new Headers(options.headers);
      for (const [key, value] of Object.entries(customHeaders)) {
        options.headers.append(key, value);
      }
    } else {
      options.headers = new Headers(customHeaders);
    }

    return originalFetch(url, options);
  };
}

export default interceptFetch;
