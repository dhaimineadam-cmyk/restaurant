import axios from 'axios';

const configuredBaseUrl = process.env.REACT_APP_API_URL || 'https://restaurant-qom1.onrender.com';
const baseURL = configuredBaseUrl.endsWith('/api')
    ? configuredBaseUrl
    : `${configuredBaseUrl.replace(/\/$/, '')}/api`;
const storageBase = configuredBaseUrl.replace(/\/api$/, '').replace(/\/$/, '');

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

export const getCurrentRestaurantId = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.restaurant_id || user.restaurant?.id || null;
    } catch (error) {
        return null;
    }
};

export const storageUrl = (path) => {
    if (!path) return '/placeholder.jpg';
    if (typeof path === 'string' && path.startsWith('http')) return path; // URL Cloudinary directe
    const cleaned = path?.toString().replace(/^\/+/, '');
    return `${api.defaults.baseURL.replace('/api', '')}/storage/${cleaned}`;
};

export const addRestaurantParam = (params = {}) => {
    const restaurantId = getCurrentRestaurantId();

    return restaurantId
        ? { ...params, restaurant_id: restaurantId }
        : params;
};

export const getApiErrorMessage = (error, fallback = 'Une erreur est survenue.') => {
    const data = error.response?.data;
    const validationErrors = data?.errors;

    if (validationErrors) {
        return Object.values(validationErrors).flat().join(' ');
    }

    return data?.message || error.message || fallback;
};
