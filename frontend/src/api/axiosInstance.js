import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json', // 🚩 IDHI ADD CHEYYI
    }, // 🚩 127.0.0.1 badulu localhost vaadu
});

// Request Interceptor: Add token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle 401 Errors
// axiosInstance.js
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // 401 vachindante token expire ayyindi ani artham
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                // Refresh request
                const res = await axios.post('http://localhost:5000/auth/refresh', {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` }
                });
                localStorage.setItem('access_token', res.data.access_token);
                return API(originalRequest); 
            } catch (err) {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
export default API;