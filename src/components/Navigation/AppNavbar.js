import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faStore, faUser, faSignOutAlt, faChartLine, faCog } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../../context/AuthContext';

const AppNavbar = () => {
  const { isAuthenticated, user, logout, authMethod } = useContext(AuthContext);
  const location = useLocation();

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FontAwesomeIcon icon={faStore} className="me-2" />
          Supermercado App
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {isAuthenticated && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard" active={location.pathname === '/dashboard'}>
                <FontAwesomeIcon icon={faChartLine} className="me-1" /> Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/products" active={location.pathname.startsWith('/products')}>
                Productos
              </Nav.Link>
              <Nav.Link as={Link} to="/sales" active={location.pathname.startsWith('/sales')}>
                <FontAwesomeIcon icon={faShoppingCart} className="me-1" /> Ventas
              </Nav.Link>
              {user?.role === 'admin' && (
                <Nav.Link as={Link} to="/users" active={location.pathname.startsWith('/users')}>
                  <FontAwesomeIcon icon={faUser} className="me-1" /> Usuarios
                </Nav.Link>
              )}
            </Nav>
          )}
          <Nav>
            {isAuthenticated ? (
              <NavDropdown 
                title={
                  <span>
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                    {user?.firstName || user?.username || 'Usuario'}
                  </span>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item disabled>
                  <small>Rol: {user?.role}</small>
                </NavDropdown.Item>
                <NavDropdown.Item disabled>
                  <small>Autenticación: {authMethod === 'jwt' ? 'JWT Token' : 'API Key'}</small>
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/profile">
                  <FontAwesomeIcon icon={faCog} className="me-2" />
                  Perfil
                </NavDropdown.Item>
                <NavDropdown.Item onClick={logout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              location.pathname !== '/login' && (
                <Button as={Link} to="/login" variant="outline-light">
                  Iniciar sesión
                </Button>
              )
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
