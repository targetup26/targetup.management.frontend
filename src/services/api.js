import axios from 'axios';

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000') + '/api',
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

            // Redirect to login page only if not already there
            if (!window.location.pathname.startsWith('/login')) {
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
