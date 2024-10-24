let currentProjectId;
let currentToken;

function interceptFetch(projectId, token) {
  currentProjectId = projectId;
  currentToken = token;
  const originalFetch = fetch;

  window.fetch = function (url, options = {}) {
    const customHeaders = {
      'project-id': currentProjectId,
      'Authorization': `Bearer ${currentToken}`,
    };

    if (options.headers) {
      options.headers = new Headers(options.headers);
      options.headers.set('project-id', currentProjectId);
      options.headers.set('Authorization', `Bearer ${currentToken}`);
    } else {
      options.headers = new Headers(customHeaders);
    }

    return originalFetch(url, options);
  };
}

export default interceptFetch;
