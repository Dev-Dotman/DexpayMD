export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  // Prepare headers, remove Content-Type for FormData
  const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
  };

  // If the request body is FormData, do not set Content-Type header
  if (options.body instanceof FormData) {
      delete headers['Content-Type'];
  } else {
      // Default to application/json for other content types
      headers['Content-Type'] = 'application/json';
  }

  const config = {
      ...options,
      headers,
  };

  // Make the fetch request
  const response = await fetch(url, config);
  return response;
};
