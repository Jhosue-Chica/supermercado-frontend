import React, { createContext, useState, useEffect } from 'react';
import { verifyToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authMethod, setAuthMethod] = useState(localStorage.getItem('authMethod') || '');

    // Verificar autenticación al cargar la aplicación
    useEffect(() => {
        const checkAuth = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            const apiKey = localStorage.getItem('apiKey');
            const method = localStorage.getItem('authMethod');

            if (storedUser && (token || apiKey)) {
                try {
                    // Solo verificar token JWT
                    if (method === 'jwt' && token) {
                        await verifyToken();
                    }
                    
                    setUser(JSON.parse(storedUser));
                    setAuthMethod(method);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error de autenticación:', error);
                    logout();
                }
            }
            
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Iniciar sesión con JWT
    const loginWithJWT = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('authMethod', 'jwt');
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setAuthMethod('jwt');
        setIsAuthenticated(true);
    };

    // Iniciar sesión con API Key
    const loginWithApiKey = (userData, apiKey) => {
        localStorage.setItem('apiKey', apiKey);
        localStorage.setItem('authMethod', 'apikey');
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setAuthMethod('apikey');
        setIsAuthenticated(true);
    };

    // Cerrar sesión
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('apiKey');
        localStorage.removeItem('authMethod');
        localStorage.removeItem('user');
        
        setUser(null);
        setAuthMethod('');
        setIsAuthenticated(false);
    };

    // Valores del contexto
    const contextValue = {
        isAuthenticated,
        user,
        loading,
        authMethod,
        loginWithJWT,
        loginWithApiKey,
        logout
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
