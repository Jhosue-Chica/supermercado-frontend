import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexto de autenticación
import { AuthProvider, AuthContext } from './context/AuthContext';

// Componentes
import AppNavbar from './components/Navigation/AppNavbar';

// Páginas
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProductsPage from './pages/Products/ProductsPage';
import SalesPage from './pages/Sales/SalesPage';
import NewSalePage from './pages/Sales/NewSalePage';
import UsersPage from './pages/Users/UsersPage';

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Mientras verificamos la autenticación, mostramos un loader
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigimos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostramos el componente hijo
  return children;
};

// Componente para rutas de admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no es admin, redirigimos al dashboard
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Si está autenticado y es admin, mostramos el componente hijo
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container d-flex flex-column vh-100">
          <AppNavbar />
          <main className="flex-grow-1 bg-light">
            <Routes>
              {/* Ruta pública */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Rutas privadas */}
              <Route path="/" element={
                <PrivateRoute>
                  <Navigate to="/dashboard" />
                </PrivateRoute>
              } />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } />
              
              <Route path="/products" element={
                <PrivateRoute>
                  <ProductsPage />
                </PrivateRoute>
              } />
              
              <Route path="/sales" element={
                <PrivateRoute>
                  <SalesPage />
                </PrivateRoute>
              } />
              
              <Route path="/sales/new" element={
                <PrivateRoute>
                  <NewSalePage />
                </PrivateRoute>
              } />
              
              {/* Ruta solo para administradores */}
              <Route path="/users" element={
                <AdminRoute>
                  <UsersPage />
                </AdminRoute>
              } />
              
              {/* Ruta para cualquier otra dirección */}
              <Route path="*" element={
                <PrivateRoute>
                  <Navigate to="/dashboard" replace />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <footer className="bg-dark text-light text-center py-3">
            <div className="container">
              <small>© {new Date().getFullYear()} Supermercado App - Sistema de Gestión</small>
            </div>
          </footer>
        </div>
        
        {/* Contenedor de notificaciones toast */}
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
