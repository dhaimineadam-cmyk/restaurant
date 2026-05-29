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

export const getCurrentRestaurantId = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.restaurant_id || user.restaurant?.id || null;
    } catch (error) {
        return null;
    }
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
