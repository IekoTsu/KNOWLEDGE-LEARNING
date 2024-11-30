import axios from 'axios';
import { server } from '../main';

// Set up default axios configuration
axios.defaults.withCredentials = true;

export const refreshCsrfToken = async () => {
    try {
        console.log('Requesting new CSRF token...');
        const response = await axios.get(`${server}/api/csrf-token`, { 
            withCredentials: true,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data?.csrfToken) {
            const token = response.data.csrfToken;
            axios.defaults.headers.common['csrf-token'] = token;
            axios.defaults.headers.common['x-csrf-token'] = token;
            console.log('CSRF token set successfully');
            return true;
        }
        console.error('Invalid token response:', response.data);
        return false;
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
        return false;
    }
};

// Initialize CSRF token when the app starts
refreshCsrfToken();

// Axios interceptor for requests
axios.interceptors.request.use(
    config => {
        // Ensure token is in headers for all non-GET requests
        if (config.method !== 'get') {
            const token = axios.defaults.headers.common['csrf-token'];
            if (token) {
                config.headers['csrf-token'] = token;
                config.headers['x-csrf-token'] = token;
            }
        }
        return config;
    },
    error => Promise.reject(error)
);

// Axios interceptor for responses
axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        if (error.response?.status === 403 && 
            error.response?.data?.message?.includes('CSRF')) {
            console.log('CSRF error detected, refreshing token...');
            originalRequest._retry = true;
            
            const success = await refreshCsrfToken();
            if (success) {
                return axios(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);