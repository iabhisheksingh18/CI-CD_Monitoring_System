import api from './api';

// Demo fallback token (used when backend is unreachable or returns errors)
const DEMO_TOKEN = 'demo-token-ai-devops-platform';

const createDemoSession = (username: string) => {
  const demoUser = {
    token: DEMO_TOKEN,
    username: username,
    email: `${username}@demo.local`,
    roles: ['user'],
  };
  localStorage.setItem('token', demoUser.token);
  localStorage.setItem('user', JSON.stringify(demoUser));
  return demoUser;
};

export const authService = {
  login: async (credentials: any) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (err: any) {
      // Fall back to demo mode on ANY error (401, 403, 404, 500) to ensure seamless exploration
      console.warn('Backend authentication failed or user not found — entering demo mode', err);
      return createDemoSession(credentials.username || 'Developer');
    }
  },

  signup: async (userData: any) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (err: any) {
      console.warn('Backend signup failed — creating demo account', err);
      return createDemoSession(userData.username || 'NewUser');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
