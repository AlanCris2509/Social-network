import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/auth';

export const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
});

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const res = await axios.post('http://localhost:8080/api/auth/refresh', { refreshToken });
    setTokens(res.data.accessToken, res.data.refreshToken);
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                if (!refreshPromise) {
                    refreshPromise = doRefresh().finally(() => {
                        refreshPromise = null;
                    });
                }
                await refreshPromise;
                originalRequest.headers.Authorization = `Bearer ${getAccessToken()}`;
                return apiClient(originalRequest);
            } catch {
                clearTokens();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);
