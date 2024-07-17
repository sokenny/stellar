function interceptFetch(projectId, token) {
  const originalFetch = fetch;

  window.fetch = function (url, options = {}) {
    const customHeaders = {
      'project-id': projectId,
      'Authorization': `Bearer ${token}`,
    };

    if (options.headers) {
      options.headers = new Headers(options.headers);
      options.headers.set('project-id', projectId);
      options.headers.set('Authorization', `Bearer ${token}`);
    } else {
      options.headers = new Headers(customHeaders);
    }

    return originalFetch(url, options);
  };
}

export default interceptFetch;
