import axios from 'axios';
import { server } from '../main';

export const refreshCsrfToken = async () => {
    try {
        const { data } = await axios.get(`${server}/api/csrf-token`, { 
            withCredentials: true 
        });
        
        if (data.csrfToken) {
            axios.defaults.headers.common['csrf-token'] = data.csrfToken;
            console.log('CSRF token refreshed');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
        return false;
    }
};

// Set up default axios configuration
axios.defaults.withCredentials = true;

// Axios interceptor to handle CSRF errors
axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 403 && 
            error.response?.data?.message?.includes('CSRF')) {
            
            const success = await refreshCsrfToken();
            if (success) {
                // Retry the original request
                const config = error.config;
                config.headers['csrf-token'] = axios.defaults.headers.common['csrf-token'];
                return axios(config);
            }
        }
        return Promise.reject(error);
    }
);