const truthy = (val) => ['1', 'true', 'yes', 'on'].includes(String(val || '').toLowerCase());

export const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api',
  authBypass: truthy(process.env.REACT_APP_AUTH_BYPASS),
  bypassUser: {
    id: '00000000-0000-0000-0000-0000000000aa',
    email: 'bypass@example.com',
    name: 'Bypass User',
    role: 'admin',
  },
};

export default config;
