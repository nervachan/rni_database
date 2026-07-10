import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// Single shared axios instance used by every service file (applicationService.js,
// ipService.js, startupService.js, researchEntryService.js) instead of each one
// calling fetch() on its own. Centralizing it here means auth headers and error
// handling only need to be written once, not copy-pasted into every service.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Runs before every outgoing request. Firebase issues a short-lived ID token
// once a user logs in (see stores/auth.js), and the backend's verifyToken
// middleware (authMiddleware.cjs) expects that token on every protected route.
// This interceptor grabs the current token and attaches it automatically, so
// individual service functions never have to remember to do it themselves.
api.interceptors.request.use(async (config) => {
  const authStore = useAuthStore();
  const token = await authStore.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Runs after every response. Axios throws a generic error like "Request failed
// with status code 500" by default, which isn't useful to show a user. Our
// Express backend already sends back a specific reason in the response body
// (e.g. { error: 'Invalid id' }) — this interceptor pulls that real message out
// and throws it instead, so every service/component that does `catch (err)` and
// shows `err.message` gets something a person can actually understand.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

export default api;