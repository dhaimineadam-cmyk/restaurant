import axios from 'axios';

const configuredBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const baseURL = configuredBaseUrl.endsWith('/api')
    ? configuredBaseUrl
    : `${configuredBaseUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
    baseURL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers.Accept = 'application/json';
    console.log('[API REQUEST]', config.method?.toUpperCase(), config.url, config.data || null);
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log('[API RESPONSE]', response.status, response.config.url, response.data);
        return response;
    },
    (error) => {
        console.error(
            '[API ERROR]',
            error.response?.status,
            error.config?.url,
            error.response?.data || error.message
        );
        return Promise.reject(error);
    }
);

export default api;
