// src/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const customFetch = async (url: string, options: Record<string, any> = {}) => {
  // Prepend the base URL to the request URL
  const fullUrl = `${API_BASE_URL}${url}`;
debugger;
  // Add the Authorization header if a token is stored
  const token = localStorage.getItem('token');
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  options.headers = {
    ...options.headers,
    "Access-Control-Allow-Origin": '*',
    'Content-Type': 'application/json',
  };
  console.log(options);

  // Perform the fetch request with the full URL and options
  const response = await fetch(fullUrl, options);

  // Check for HTTP errors
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

// export customFetch;
