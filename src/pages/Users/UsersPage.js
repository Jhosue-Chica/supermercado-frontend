import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faKey } from '@fortawesome/free-solid-svg-icons';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/api';
import ApiDataDisplay from '../../components/ApiDataDisplay/ApiDataDisplay';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, user: null });

  // Definición de columnas para la tabla de usuarios
  const userColumns = [
    { field: 'username', header: 'Usuario' },
    { field: 'firstName', header: 'Nombre' },
    { field: 'lastName', header: 'Apellido' },
    { field: 'email', header: 'Email' },
    { 
      field: 'role', 
      header: 'Rol',
      renderer: (item) => (
        <Badge bg={getRoleBadgeColor(item.role)}>
          {getRoleName(item.role)}
        </Badge>
      )
    },
    { 
      field: 'active', 
      header: 'Estado',
      renderer: (item) => (
        <Badge bg={item.active ? 'success' : 'danger'}>
          {item.active ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    { 
      field: 'actions', 
      header: 'Acciones',
      style: { width: '180px' },
      renderer: (item) => (
        <div className="d-flex">
          <Button 
            size="sm" 
            variant="outline-primary" 
            className="me-1"
            onClick={() => handleEdit(item)}
          >
            <FontAwesomeIcon icon={faEdit} />
          </Button>
          <Button 
            size="sm" 
            variant="outline-warning" 
            className="me-1"
            onClick={() => handleChangePassword(item)}
          >
            <FontAwesomeIcon icon={faKey} />
          </Button>
          <Button 
            size="sm" 
            variant="outline-danger"
            onClick={() => handleDelete(item)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      )
    }
  ];

  // Helper para color de badge según rol
  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      case 'employee': return 'primary';
      default: return 'secondary';
    }
  };

  // Helper para nombre del rol
  const getRoleName = (role) => {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'employee': return 'Empleado';
      default: return role;
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para cargar usuarios
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar los usuarios');
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear un nuevo usuario
  const handleNew = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  // Abrir modal para editar un usuario existente
  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  // Abrir modal para cambiar contraseña
  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  // Confirmar la eliminación de un usuario
  const handleDelete = (user) => {
    setConfirmDelete({
      show: true,
      user
    });
  };

  const handleCloseConfirmDelete = () => {
    setConfirmDelete({ show: false, user: null });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser(confirmDelete.user.id);
      fetchUsers(); // Recargar usuarios
      setError(null);
      handleCloseConfirmDelete();
    } catch (err) {
      setError(err.message || 'Error al eliminar el usuario');
      console.error('Error eliminando usuario:', err);
    }
  };

  // Schema de validación para el formulario de usuario
  const userSchema = Yup.object().shape({
    username: Yup.string()
      .required('El nombre de usuario es requerido')
      .min(4, 'El nombre de usuario debe tener al menos 4 caracteres'),
    firstName: Yup.string().required('El nombre es requerido'),
    lastName: Yup.string().required('El apellido es requerido'),
    email: Yup.string()
      .email('Email inválido')
      .required('El email es requerido'),
    role: Yup.string().required('El rol es requerido'),
    password: Yup.string()
      .when(['isNewUser'], (isNewUser, schema) => {
        return isNewUser[0] === true
          ? schema.required('La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres')
          : schema
      }),
    active: Yup.boolean()
  });

  // Schema de validación para el cambio de contraseña
  const passwordSchema = Yup.object().shape({
    password: Yup.string()
      .required('La contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: Yup.string()
      .required('Confirma la contraseña')
      .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
  });

  // Manejar el envío del formulario de usuario
  const handleUserSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingUser) {
        // Si estamos editando, no enviamos la contraseña vacía
        const { password, ...userData } = values;
        await updateUser(editingUser.id, userData);
      } else {
        // Si es un nuevo usuario, enviamos todos los datos
        await createUser(values);
      }
      
      setShowModal(false);
      resetForm();
      fetchUsers(); // Recargar usuarios
    } catch (err) {
      setError(err.message || 'Error al guardar el usuario');
      console.error('Error guardando usuario:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar el envío del formulario de cambio de contraseña
  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await updateUser(selectedUser.id, { password: values.password });
      setShowPasswordModal(false);
      resetForm();
      alert('Contraseña actualizada correctamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña');
      console.error('Error actualizando contraseña:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>Gestión de Usuarios</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleNew}>
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Nuevo Usuario
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row>
        <Col>
          <ApiDataDisplay 
            title="Listado de Usuarios"
            data={users}
            loading={loading}
            error={error}
            columns={userColumns}
            onRefresh={fetchUsers}
            emptyMessage="No hay usuarios registrados"
          />
        </Col>
      </Row>

      {/* Modal Formulario de Usuario */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            ...editingUser || {
              username: '',
              firstName: '',
              lastName: '',
              email: '',
              role: 'employee',
              password: '',
              active: true
            },
            isNewUser: !editingUser
          }}
          validationSchema={userSchema}
          onSubmit={handleUserSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre de Usuario</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.username && errors.username}
                        disabled={editingUser} // No permitir cambiar el username en edición
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Rol</Form.Label>
                      <Form.Select
                        name="role"
                        value={values.role}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.role && errors.role}
                      >
                        <option value="admin">Administrador</option>
                        <option value="manager">Gerente</option>
                        <option value="employee">Empleado</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.role}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.firstName && errors.firstName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.lastName && errors.lastName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

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

                {!editingUser && (
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
                )}

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="user-active"
                    label="Usuario Activo"
                    name="active"
                    checked={values.active}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Modal Cambio de Contraseña */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Contraseña</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            password: '',
            confirmPassword: ''
          }}
          validationSchema={passwordSchema}
          onSubmit={handlePasswordSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                {selectedUser && (
                  <Alert variant="info">
                    Cambiando contraseña para el usuario: <strong>{selectedUser.username}</strong>
                  </Alert>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>Nueva Contraseña</Form.Label>
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

                <Form.Group className="mb-3">
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.confirmPassword && errors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Cambiar Contraseña'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Modal Confirmación de Eliminación de Usuario */}
      <Modal show={confirmDelete.show} onHide={handleCloseConfirmDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de que deseas eliminar al usuario <strong>"{confirmDelete.user?.username}"</strong>?
          </p>
          <p className="text-danger mb-0">
            <FontAwesomeIcon icon={faTrash} className="me-2" />
            Esta acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmDelete}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UsersPage;
