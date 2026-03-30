import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, ''); // Remove any trailing slashes

const api = axios.create({
    baseURL: cleanBaseUrl + '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Don't redirect on public pages (share links, join form, etc.)
            const publicPaths = ['/login', '/share', '/share-folder', '/join'];
            const isPublicPage = publicPaths.some(p => window.location.pathname.startsWith(p));
            if (!isPublicPage) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const getApiBaseUrl = () => {
    return api.defaults.baseURL;
};

export default api;
