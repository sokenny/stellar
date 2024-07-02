function interceptFetch(projectId) {
  console.log('intercept fetch llamada!');
  // Store the original fetch function
  const originalFetch = fetch;

  // Override the global fetch function
  window.fetch = function (url, options = {}) {
    // Add your custom headers here
    const customHeaders = { 'Project-ID': projectId };

    // Merge with existing headers if they exist
    if (options.headers) {
      options.headers = new Headers(options.headers);
      for (const [key, value] of Object.entries(customHeaders)) {
        options.headers.append(key, value);
      }
    } else {
      options.headers = new Headers(customHeaders);
    }

    // Call the original fetch function with updated options
    return originalFetch(url, options);
  };
}

export default interceptFetch;
