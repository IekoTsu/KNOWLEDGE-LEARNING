import axios from 'axios';
import { server } from '../main';

export const refreshCsrfToken = async () => {
    try {
        const { data } = await axios.get(`${server}/api/csrf-token`, { withCredentials: true });
        if (data.csrfToken) {
            axios.defaults.headers.common['csrf-token'] = data.csrfToken;
            console.log('CSRF token refreshed:', data.csrfToken);
            return true;
        }
        console.error('No CSRF token in response');
        return false;
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
        return false;
    }
};

// Axios interceptor to handle CSRF errors
axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        // Prevent infinite retry loop
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        if (error.response?.status === 403 && 
            error.response?.data?.message?.includes('CSRF')) {
            console.log('CSRF error detected, attempting refresh...');
            originalRequest._retry = true;
            
            // Try to refresh CSRF token
            const success = await refreshCsrfToken();
            if (success) {
                // Update the failed request with new token
                originalRequest.headers['csrf-token'] = axios.defaults.headers.common['csrf-token'];
                console.log('Retrying request with new CSRF token');
                return axios(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

// Set up default axios configuration
axios.defaults.withCredentials = true;