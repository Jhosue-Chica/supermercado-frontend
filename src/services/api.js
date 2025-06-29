import axios from 'axios';

// Crear instancia base de Axios
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para añadir token JWT o API Key automáticamente
api.interceptors.request.use(
    (config) => {
        // Obtener información de autenticación del localStorage
        const authMethod = localStorage.getItem('authMethod');
        
        if (authMethod === 'jwt') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        } else if (authMethod === 'apikey') {
            const apiKey = localStorage.getItem('apiKey');
            if (apiKey) {
                config.headers['x-api-key'] = apiKey;
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Manejar errores de autenticación (401)
        if (error.response && error.response.status === 401) {
            // Eliminar credenciales y redirigir al login
            localStorage.removeItem('token');
            localStorage.removeItem('apiKey');
            localStorage.removeItem('authMethod');
            localStorage.removeItem('user');
            
            // En una aplicación real redirigiríamos al login
            // window.location = '/login';
        }
        
        return Promise.reject(error);
    }
);

// Funciones de API

// Auth
export const login = async (credentials) => {
    return api.post('/auth/login', credentials);
};

export const register = async (userData) => {
    return api.post('/auth/register', userData);
};

export const verifyToken = async () => {
    return api.get('/auth/verify');
};

// Products
export const getProducts = async (params) => {
    return api.get('/products', { params });
};

export const getProduct = async (id) => {
    return api.get(`/products/${id}`);
};

export const createProduct = async (productData) => {
    return api.post('/products', productData);
};

export const updateProduct = async (id, productData) => {
    return api.put(`/products/${id}`, productData);
};

export const deleteProduct = async (id) => {
    return api.delete(`/products/${id}`);
};

export const adjustProductStock = async (id, data) => {
    return api.post(`/products/${id}/stock`, data);
};

// Sales
export const getSales = async (params) => {
    return api.get('/sales', { params });
};

export const getSale = async (id) => {
    return api.get(`/sales/${id}`);
};

export const createSale = async (saleData) => {
    return api.post('/sales', saleData);
};

export const updateSalePaymentStatus = async (id, status) => {
    return api.put(`/sales/${id}/payment-status`, { paymentStatus: status });
};

export const cancelSale = async (id, reason) => {
    return api.post(`/sales/${id}/cancel`, { reason });
};

export const getSalesStats = async (params) => {
    return api.get('/sales/stats', { params });
};

// Users
export const getUsers = async () => {
    return api.get('/users');
};

export const getUser = async (id) => {
    return api.get(`/users/${id}`);
};

export const createUser = async (userData) => {
    return api.post('/users', userData);
};

export const updateUser = async (id, userData) => {
    return api.put(`/users/${id}`, userData);
};

export const deleteUser = async (id) => {
    return api.delete(`/users/${id}`);
};

export const updateUserStatus = async (id, isActive) => {
    return api.put(`/users/${id}/status`, { isActive });
};

export default api;
