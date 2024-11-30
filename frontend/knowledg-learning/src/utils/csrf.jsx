import axios from 'axios';
import { server } from '../main';

export const refreshCsrfToken = async () => {
    try {
        console.log('Requesting new CSRF token...');
        const { data } = await axios.get(`${server}/api/csrf-token`, { 
            withCredentials: true,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
        
        if (data.csrfToken) {
            // Set both header variations to be safe
            axios.defaults.headers.common['csrf-token'] = data.csrfToken;
            axios.defaults.headers.common['x-csrf-token'] = data.csrfToken;
            
            console.log('CSRF token set in axios headers:', {
                'csrf-token': axios.defaults.headers.common['csrf-token'],
                'x-csrf-token': axios.defaults.headers.common['x-csrf-token']
            });
            
            return true;
        }
        console.error('No CSRF token in response:', data);
        return false;
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error.response || error);
        return false;
    }
};

// Axios interceptor to handle CSRF errors
axios.interceptors.request.use(
    config => {
        // Log outgoing request headers
        console.log('Request headers:', config.headers);
        return config;
    },
    error => Promise.reject(error)
);

axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        if (originalRequest._retry) {
            console.log('Request already retried, giving up');
            return Promise.reject(error);
        }

        if (error.response?.status === 403 && 
            error.response?.data?.message?.includes('CSRF')) {
            console.log('CSRF error detected:', error.response.data);
            originalRequest._retry = true;
            
            const success = await refreshCsrfToken();
            if (success) {
                console.log('Retrying request with new token');
                // Update both header variations
                originalRequest.headers['csrf-token'] = axios.defaults.headers.common['csrf-token'];
                originalRequest.headers['x-csrf-token'] = axios.defaults.headers.common['x-csrf-token'];
                return axios(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

// Set up default axios configuration
axios.defaults.withCredentials = true;