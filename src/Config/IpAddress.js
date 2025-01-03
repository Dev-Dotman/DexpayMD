let config;

if (process.env.NODE_ENV === 'production') {
  config = {
    ip: 'https://dexpayserver.onrender.com',
    ip2: 'https://dexpay.vercel.app',
  };
} else {
  // Default to development
  config = {
    ip: 'https://dexpayserver.onrender.com',
    ip2: 'https://dexpay.vercel.app',
  };
}

export default config;