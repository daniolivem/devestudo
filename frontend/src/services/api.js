import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const serverMessage = error.response?.data?.message;

        if (serverMessage) error.message = serverMessage;

        if (!error.response) {
            error.message = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
        } else if (status >= 500 && !serverMessage) {
            error.message = 'Erro interno do servidor. Tente novamente em instantes.';
        }

        if (status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth:unauthorized'));
        }

        // 400 validation and 403 permission errors keep the backend message
        // available through both error.message and error.response.data.message.
        return Promise.reject(error);
    },
);

export default api;
