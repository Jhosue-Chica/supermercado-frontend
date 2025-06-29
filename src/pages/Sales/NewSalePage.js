import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getProducts, createSale } from '../../services/api';

const NewSalePage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProducts();
        setProducts(response.data.filter(product => product.stock > 0));
        setError(null);
      } catch (err) {
        setError(err.message || 'Error al cargar los productos');
        console.error('Error cargando productos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Recalcular el total cuando cambian los productos seleccionados
  useEffect(() => {
    const newTotal = selectedProducts.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    setTotal(newTotal);
  }, [selectedProducts]);

  // Añadir producto a la venta
  const addProduct = (productId, quantity = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Verificar si el producto ya está en la lista
    const existingIndex = selectedProducts.findIndex(item => item.productId === productId);

    if (existingIndex >= 0) {
      // Actualizar cantidad si ya existe
      const newSelectedProducts = [...selectedProducts];
      const newQuantity = newSelectedProducts[existingIndex].quantity + quantity;
      
      // Verificar que no exceda el stock disponible
      if (newQuantity > product.stock) {
        alert(`Solo hay ${product.stock} unidades disponibles de este producto.`);
        return;
      }
      
      newSelectedProducts[existingIndex].quantity = newQuantity;
      setSelectedProducts(newSelectedProducts);
    } else {
      // Agregar nuevo producto
      const newItem = {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        stock: product.stock,
        quantity: quantity
      };
      setSelectedProducts([...selectedProducts, newItem]);
    }
  };

  // Remover producto de la venta
  const removeProduct = (index) => {
    const newSelectedProducts = [...selectedProducts];
    newSelectedProducts.splice(index, 1);
    setSelectedProducts(newSelectedProducts);
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (index, quantity) => {
    const product = selectedProducts[index];
    
    // Verificar que no exceda el stock disponible
    if (quantity > product.stock) {
      alert(`Solo hay ${product.stock} unidades disponibles de este producto.`);
      return;
    }
    
    const newSelectedProducts = [...selectedProducts];
    newSelectedProducts[index].quantity = quantity;
    setSelectedProducts(newSelectedProducts);
  };

  // Validación para el formulario de venta
  const saleSchema = Yup.object().shape({
    customerName: Yup.string().required('El nombre del cliente es requerido'),
    customerPhone: Yup.string(),
    customerEmail: Yup.string().email('Email inválido'),
    paymentMethod: Yup.string().required('El método de pago es requerido'),
    paymentStatus: Yup.string().required('El estado de pago es requerido'),
    notes: Yup.string()
  });

  // Manejar envío del formulario
  const handleSubmit = async (values, { setSubmitting }) => {
    // Verificar que haya productos seleccionados
    if (selectedProducts.length === 0) {
      alert('Debe agregar al menos un producto a la venta.');
      setSubmitting(false);
      return;
    }

    try {
      // Crear la estructura de datos para la venta
      const saleData = {
        customer: {
          name: values.customerName,
          phone: values.customerPhone,
          email: values.customerEmail
        },
        items: selectedProducts.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        paymentMethod: values.paymentMethod,
        paymentStatus: values.paymentStatus,
        notes: values.notes,
        totalAmount: total
      };

      // Enviar la venta a la API
      await createSale(saleData);
      
      // Redirigir a la lista de ventas
      navigate('/sales');
    } catch (err) {
      setError(err.message || 'Error al crear la venta');
      console.error('Error creando venta:', err);
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>Nueva Venta</h2>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Agregar Productos</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p className="text-center my-3">Cargando productos...</p>
              ) : (
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Seleccionar Producto</Form.Label>
                      <Form.Select 
                        onChange={(e) => {
                          if (e.target.value) {
                            addProduct(e.target.value);
                            e.target.value = ''; // Resetear el select
                          }
                        }}
                        disabled={products.length === 0}
                      >
                        <option value="">Seleccione un producto</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ${product.price} (Stock: {product.stock})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              )}

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th style={{ width: '120px' }}>Cantidad</th>
                      <th className="text-end">Subtotal</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No hay productos en la venta
                        </td>
                      </tr>
                    ) : (
                      selectedProducts.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productName}</td>
                          <td>${item.unitPrice.toLocaleString('es-MX')}</td>
                          <td>
                            <Form.Control
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 0)}
                              size="sm"
                            />
                          </td>
                          <td className="text-end">
                            ${(item.quantity * item.unitPrice).toLocaleString('es-MX')}
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeProduct(index)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="3" className="text-end">Total:</th>
                      <th className="text-end">${total.toLocaleString('es-MX')}</th>
                      <th></th>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Datos de Venta</h5>
            </Card.Header>
            <Card.Body>
              <Formik
                initialValues={{
                  customerName: '',
                  customerPhone: '',
                  customerEmail: '',
                  paymentMethod: 'cash',
                  paymentStatus: 'pending',
                  notes: ''
                }}
                validationSchema={saleSchema}
                onSubmit={handleSubmit}
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
                    <Form.Group className="mb-3">
                      <Form.Label>Cliente</Form.Label>
                      <Form.Control
                        type="text"
                        name="customerName"
                        value={values.customerName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.customerName && errors.customerName}
                        placeholder="Nombre del cliente"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.customerName}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="text"
                        name="customerPhone"
                        value={values.customerPhone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="customerEmail"
                        value={values.customerEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.customerEmail && errors.customerEmail}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.customerEmail}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Método de Pago</Form.Label>
                      <Form.Select
                        name="paymentMethod"
                        value={values.paymentMethod}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <option value="cash">Efectivo</option>
                        <option value="credit_card">Tarjeta de Crédito</option>
                        <option value="debit_card">Tarjeta de Débito</option>
                        <option value="transfer">Transferencia</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Estado de Pago</Form.Label>
                      <Form.Select
                        name="paymentStatus"
                        value={values.paymentStatus}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagado</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Notas</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="notes"
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={3}
                      />
                    </Form.Group>

                    <div className="d-grid gap-2 mt-4">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={isSubmitting || selectedProducts.length === 0}
                      >
                        <FontAwesomeIcon icon={faSave} className="me-1" />
                        {isSubmitting ? 'Guardando...' : 'Guardar Venta'}
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => navigate('/sales')}
                      >
                        <FontAwesomeIcon icon={faTimes} className="me-1" />
                        Cancelar
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NewSalePage;
