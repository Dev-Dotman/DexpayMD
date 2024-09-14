export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
  
    const config = {
      ...options,
      headers,
    };
  
    const response = await fetch(url, config);
    return response;
  };
  