import axios from 'axios';
import { server } from '../main';

export const refreshCsrfToken = async () => {
    try {
        const { data } = await axios.get(`${server}/api/csrf-token`, { withCredentials: true });
        axios.defaults.headers.common['csrf-token'] = data.csrfToken;
        return true;
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
        return false;
    }
};

// Axios interceptor to handle CSRF errors
axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 403 && 
            error.response?.data?.message?.includes('CSRF')) {
            // Try to refresh CSRF token
            const success = await refreshCsrfToken();
            if (success) {
                // Retry the original request
                return axios(error.config);
            }
        }
        return Promise.reject(error);
    }
);