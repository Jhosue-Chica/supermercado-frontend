import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Auth from '../../components/Auth/Auth';
import AuthContext from '../../context/AuthContext';

const LoginPage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Container>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={5}>
          <div className="text-center mb-4">
            <h1 className="display-5 fw-bold text-primary">Supermercado</h1>
            <p className="text-muted">Sistema de Gestión</p>
          </div>
          <Auth />
          <Card className="mt-3 shadow-sm border-0">
            <Card.Body className="p-3">
              <small className="text-muted">
                <strong>Credenciales de prueba:</strong><br />
                Admin: admin / admin123<br />
                Empleado: employee / employee123<br />
                API Key: sk_test_supermercado123
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
