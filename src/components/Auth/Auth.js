import React, { useState, useContext } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { login } from '../../services/api';
import AuthContext from '../../context/AuthContext';

const Auth = () => {
  const [authType, setAuthType] = useState('jwt');
  const [error, setError] = useState('');
  const { loginWithJWT, loginWithApiKey } = useContext(AuthContext);

  // Esquemas de validación
  const jwtSchema = Yup.object().shape({
    username: Yup.string().when('useEmail', (useEmail, schema) => 
      useEmail === false ? schema.required('El nombre de usuario es requerido') : schema
    ),
    email: Yup.string().when('useEmail', (useEmail, schema) => 
      useEmail === true ? schema.email('Email inválido').required('El email es requerido') : schema
    ),
    password: Yup.string().required('La contraseña es requerida'),
    useEmail: Yup.boolean()
  });

  const apiKeySchema = Yup.object().shape({
    apiKey: Yup.string().required('La API key es requerida')
  });

  // Manejar el envío del formulario JWT
  const handleJWTSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      const credentials = values.useEmail 
        ? { email: values.email, password: values.password } 
        : { username: values.username, password: values.password };
      
      const response = await login(credentials);
      loginWithJWT(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Error de autenticación. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar el envío de API Key (simulado - en producción esto podría requerir una verificación diferente)
  const handleApiKeySubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      // En un caso real, podríamos validar la API key contra el servidor
      // Por ahora, vamos a simular un usuario para la API key
      const apiKeyUser = {
        id: 'api-user',
        username: 'api-user',
        email: 'api@example.com',
        role: 'admin'
      };
      
      loginWithApiKey(apiKeyUser, values.apiKey);
    } catch (err) {
      setError('API Key inválida. Por favor, verifica e intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body className="p-4">
        <h2 className="mb-4 text-center">Acceso al Sistema</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-center">
              <Button 
                variant={authType === 'jwt' ? 'primary' : 'outline-primary'} 
                onClick={() => setAuthType('jwt')}
                className="me-2"
              >
                JWT Token
              </Button>
              <Button 
                variant={authType === 'apikey' ? 'primary' : 'outline-primary'} 
                onClick={() => setAuthType('apikey')}
              >
                API Key
              </Button>
            </div>
          </Col>
        </Row>

        {authType === 'jwt' ? (
          <Formik
            initialValues={{ username: '', email: '', password: '', useEmail: false }}
            validationSchema={jwtSchema}
            onSubmit={handleJWTSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              setFieldValue
            }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="useEmail"
                    label="Usar email en lugar de nombre de usuario"
                    checked={values.useEmail}
                    onChange={() => setFieldValue('useEmail', !values.useEmail)}
                  />
                </Form.Group>

                {!values.useEmail ? (
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre de usuario</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={values.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.username && errors.username}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                    </Form.Control.Feedback>
                  </Form.Group>
                ) : (
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.email && errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.password && errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  </Button>
                </div>

                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Prueba con: admin/admin123 o employee/employee123
                  </small>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ apiKey: '' }}
            validationSchema={apiKeySchema}
            onSubmit={handleApiKeySubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>API Key</Form.Label>
                  <Form.Control
                    type="text"
                    name="apiKey"
                    value={values.apiKey}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.apiKey && errors.apiKey}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.apiKey}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Ingresa tu API key para acceder al sistema
                  </Form.Text>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Verificando...' : 'Verificar API Key'}
                  </Button>
                </div>

                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Prueba con: sk_test_supermercado123
                  </small>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </Card.Body>
    </Card>
  );
};

export default Auth;
