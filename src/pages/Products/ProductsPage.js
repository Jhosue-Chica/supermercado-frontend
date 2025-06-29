import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Modal, Form, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { getProducts, createProduct, updateProduct, deleteProduct, adjustProductStock } from '../../services/api';
import ApiDataDisplay from '../../components/ApiDataDisplay/ApiDataDisplay';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, product: null });

  // Definición de columnas para la tabla de productos
  const productColumns = [
    { field: 'code', header: 'Código', style: { width: '100px' } },
    { field: 'name', header: 'Producto' },
    { field: 'category', header: 'Categoría' },
    { 
      field: 'price', 
      header: 'Precio', 
      renderer: (item) => `$${item.price.toLocaleString('es-MX')}`
    },
    { field: 'stock', header: 'Stock' },
    { 
      field: 'actions', 
      header: 'Acciones',
      style: { width: '200px' },
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
            variant="outline-success" 
            className="me-1"
            onClick={() => handleStockAdjust(item)}
          >
            <FontAwesomeIcon icon={faBoxOpen} />
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

  // Schema de validación para el formulario de producto
  const productSchema = Yup.object().shape({
    code: Yup.string().required('El código es requerido'),
    name: Yup.string().required('El nombre es requerido'),
    description: Yup.string(),
    price: Yup.number().required('El precio es requerido').positive('El precio debe ser positivo'),
    cost: Yup.number().required('El costo es requerido').positive('El costo debe ser positivo'),
    stock: Yup.number().required('El stock es requerido').min(0, 'El stock no puede ser negativo'),
    category: Yup.string().required('La categoría es requerida'),
    supplier: Yup.string(),
    discount: Yup.number().min(0, 'El descuento no puede ser negativo').max(100, 'El descuento no puede ser mayor a 100%')
  });

  // Schema de validación para el formulario de ajuste de stock
  const stockAdjustSchema = Yup.object().shape({
    quantity: Yup.number().required('La cantidad es requerida').positive('La cantidad debe ser positiva'),
    operation: Yup.string().required('La operación es requerida').oneOf(['add', 'subtract'], 'Operación no válida')
  });

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);

  // Función para cargar productos
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts();
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar los productos');
      console.error('Error cargando productos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear un nuevo producto
  const handleNew = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  // Abrir modal para editar un producto existente
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  // Abrir modal para ajustar stock
  const handleStockAdjust = (product) => {
    setSelectedProduct(product);
    setShowStockModal(true);
  };

  // Confirmar la eliminación de un producto
  const handleDelete = async (product) => {
    setConfirmDelete({
      show: true,
      product
    });
  };

  const handleCloseConfirmDelete = () => {
    setConfirmDelete({ show: false, product: null });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProduct(confirmDelete.product.id);
      fetchProducts(); // Recargar productos
      setError(null);
      handleCloseConfirmDelete();
    } catch (err) {
      setError(err.message || 'Error al eliminar el producto');
      console.error('Error eliminando producto:', err);
    }
  };

  // Manejar el envío del formulario de producto
  const handleProductSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, values);
      } else {
        await createProduct(values);
      }
      
      setShowModal(false);
      resetForm();
      fetchProducts(); // Recargar productos
    } catch (err) {
      setError(err.message || 'Error al guardar el producto');
      console.error('Error guardando producto:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar el envío del formulario de ajuste de stock
  const handleStockSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await adjustProductStock(selectedProduct.id, values);
      setShowStockModal(false);
      resetForm();
      fetchProducts(); // Recargar productos
    } catch (err) {
      setError(err.message || 'Error al ajustar el stock');
      console.error('Error ajustando stock:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>Gestión de Productos</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleNew}>
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Nuevo Producto
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
            title="Listado de Productos"
            data={products}
            loading={loading}
            error={error}
            columns={productColumns}
            onRefresh={fetchProducts}
            emptyMessage="No hay productos registrados"
          />
        </Col>
      </Row>

      {/* Modal Formulario de Producto */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={editingProduct || {
            code: '',
            name: '',
            description: '',
            price: '',
            cost: '',
            stock: 0,
            category: '',
            imageUrl: '',
            supplier: '',
            discount: 0
          }}
          validationSchema={productSchema}
          onSubmit={handleProductSubmit}
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
              <Modal.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Código</Form.Label>
                      <Form.Control
                        type="text"
                        name="code"
                        value={values.code}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.code && errors.code}
                        disabled={editingProduct}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.code}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.name && errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.description && errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Precio</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={values.price}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.price && errors.price}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.price}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Costo</Form.Label>
                      <Form.Control
                        type="number"
                        name="cost"
                        value={values.cost}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.cost && errors.cost}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.cost}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock</Form.Label>
                      <Form.Control
                        type="number"
                        name="stock"
                        value={values.stock}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.stock && errors.stock}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.stock}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Categoría</Form.Label>
                      <Form.Select
                        name="category"
                        value={values.category}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.category && errors.category}
                      >
                        <option value="">Seleccione una categoría</option>
                        <option value="lácteos">Lácteos</option>
                        <option value="bebidas">Bebidas</option>
                        <option value="limpieza">Limpieza</option>
                        <option value="frutas">Frutas</option>
                        <option value="verduras">Verduras</option>
                        <option value="carnes">Carnes</option>
                        <option value="panadería">Panadería</option>
                        <option value="otros">Otros</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.category}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Proveedor</Form.Label>
                      <Form.Control
                        type="text"
                        name="supplier"
                        value={values.supplier}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.supplier && errors.supplier}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.supplier}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>URL de Imagen</Form.Label>
                      <Form.Control
                        type="text"
                        name="imageUrl"
                        value={values.imageUrl}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.imageUrl && errors.imageUrl}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Descuento (%)</Form.Label>
                      <Form.Control
                        type="number"
                        name="discount"
                        value={values.discount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.discount && errors.discount}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.discount}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
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

      {/* Modal Ajuste de Stock */}
      <Modal show={showStockModal} onHide={() => setShowStockModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajustar Stock de {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            quantity: 1,
            operation: 'add'
          }}
          validationSchema={stockAdjustSchema}
          onSubmit={handleStockSubmit}
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
                {selectedProduct && (
                  <Card className="mb-3">
                    <Card.Body>
                      <p className="mb-1"><strong>Producto:</strong> {selectedProduct.name}</p>
                      <p className="mb-1"><strong>Código:</strong> {selectedProduct.code}</p>
                      <p className="mb-0"><strong>Stock actual:</strong> {selectedProduct.stock} unidades</p>
                    </Card.Body>
                  </Card>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>Operación</Form.Label>
                  <Form.Select
                    name="operation"
                    value={values.operation}
                    onChange={handleChange}
                    isInvalid={touched.operation && errors.operation}
                  >
                    <option value="add">Agregar stock</option>
                    <option value="subtract">Quitar stock</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.operation}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={values.quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.quantity && errors.quantity}
                    min="1"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.quantity}
                  </Form.Control.Feedback>
                </Form.Group>

                {values.operation === 'subtract' && selectedProduct && values.quantity > selectedProduct.stock && (
                  <Alert variant="warning">
                    ¡Atención! Estás intentando quitar más unidades de las que hay disponibles.
                  </Alert>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowStockModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSubmitting || (values.operation === 'subtract' && selectedProduct && values.quantity > selectedProduct.stock)}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Modal Confirmación de Eliminación */}
      <Modal show={confirmDelete.show} onHide={handleCloseConfirmDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de que deseas eliminar el producto <strong>"{confirmDelete.product?.name}"</strong>?
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

export default ProductsPage;
