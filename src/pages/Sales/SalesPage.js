import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTimes, faCheck, faMoneyBill, faTrash } from '@fortawesome/free-solid-svg-icons';
import { getSales, cancelSale, updateSalePaymentStatus } from '../../services/api';
import ApiDataDisplay from '../../components/ApiDataDisplay/ApiDataDisplay';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState({ show: false, sale: null });

  // Definición de columnas para la tabla de ventas
  const salesColumns = [
    { field: 'id', header: 'ID', style: { width: '70px' } },
    { 
      field: 'date', 
      header: 'Fecha',
      renderer: (item) => new Date(item.date).toLocaleString('es-MX')
    },
    { 
      field: 'totalAmount', 
      header: 'Total', 
      renderer: (item) => `$${item.totalAmount.toLocaleString('es-MX')}`
    },
    { field: 'customer.name', header: 'Cliente' },
    { 
      field: 'paymentStatus', 
      header: 'Estado Pago',
      renderer: (item) => (
        <Badge bg={item.paymentStatus === 'paid' ? 'success' : 'warning'}>
          {item.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
        </Badge>
      )
    },
    { 
      field: 'status', 
      header: 'Estado',
      renderer: (item) => (
        <Badge bg={getBadgeColor(item.status)}>
          {getStatusText(item.status)}
        </Badge>
      )
    },
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
            onClick={() => handleView(item)}
          >
            <FontAwesomeIcon icon={faEdit} />
          </Button>
          {item.paymentStatus === 'pending' && (
            <Button 
              size="sm" 
              variant="outline-success" 
              className="me-1"
              onClick={() => handlePayment(item)}
            >
              <FontAwesomeIcon icon={faMoneyBill} />
            </Button>
          )}
          {item.status !== 'cancelled' && (
            <Button 
              size="sm" 
              variant="outline-danger"
              onClick={() => handleCancel(item)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          )}
        </div>
      )
    }
  ];

  // Helper para color de badge según estado
  const getBadgeColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'processing': return 'primary';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Helper para texto de estado
  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Completado';
      case 'processing': return 'En Proceso';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Cargar ventas al montar el componente
  useEffect(() => {
    fetchSales();
  }, []);

  // Función para cargar ventas
  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await getSales();
      setSales(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar las ventas');
      console.error('Error cargando ventas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ver detalles de una venta
  const handleView = (sale) => {
    setEditingSale(sale);
    setShowModal(true);
  };

  // Abrir modal para procesar pago
  const handlePayment = (sale) => {
    setSelectedSale(sale);
    setShowPaymentModal(true);
  };

  // Confirmar la cancelación de una venta
  const handleCancel = (sale) => {
    setConfirmCancel({
      show: true,
      sale
    });
  };

  const handleCloseConfirmCancel = () => {
    setConfirmCancel({ show: false, sale: null });
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelSale(confirmCancel.sale.id, { reason: 'Cancelado por el usuario' });
      fetchSales(); // Recargar ventas
      setError(null);
      handleCloseConfirmCancel();
    } catch (err) {
      setError(err.message || 'Error al cancelar la venta');
      console.error('Error cancelando venta:', err);
    }
  };

  // Manejar el pago de una venta
  const handlePaymentSubmit = async (values, { setSubmitting }) => {
    try {
      await updateSalePaymentStatus(selectedSale.id, values.paymentStatus);
      setShowPaymentModal(false);
      fetchSales(); // Recargar ventas
    } catch (err) {
      setError(err.message || 'Error al procesar el pago');
      console.error('Error procesando pago:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>Gestión de Ventas</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => window.location.href = '/sales/new'}>
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Nueva Venta
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
            title="Listado de Ventas"
            data={sales}
            loading={loading}
            error={error}
            columns={salesColumns}
            onRefresh={fetchSales}
            emptyMessage="No hay ventas registradas"
          />
        </Col>
      </Row>

      {/* Modal para ver detalles de venta */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles de Venta #{editingSale?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingSale && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Fecha:</strong> {new Date(editingSale.date).toLocaleString('es-MX')}</p>
                  <p><strong>Cliente:</strong> {editingSale.customer.name}</p>
                  <p><strong>Teléfono:</strong> {editingSale.customer.phone || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Estado:</strong> {getStatusText(editingSale.status)}</p>
                  <p><strong>Pago:</strong> {editingSale.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}</p>
                  <p><strong>Método de Pago:</strong> {editingSale.paymentMethod || 'N/A'}</p>
                </Col>
              </Row>

              <h6>Productos</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Cantidad</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingSale.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.product.name}</td>
                        <td>${item.unitPrice.toLocaleString('es-MX')}</td>
                        <td>{item.quantity}</td>
                        <td className="text-end">${(item.quantity * item.unitPrice).toLocaleString('es-MX')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="3" className="text-end">Total:</th>
                      <th className="text-end">${editingSale.totalAmount.toLocaleString('es-MX')}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {editingSale.notes && (
                <div className="mt-3">
                  <h6>Notas</h6>
                  <p>{editingSale.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para procesar pago */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Procesar Pago</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            paymentMethod: 'cash',
            paymentReference: '',
            paymentStatus: 'paid'
          }}
          onSubmit={handlePaymentSubmit}
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
                {selectedSale && (
                  <Alert variant="info">
                    <p className="mb-1"><strong>Venta #:</strong> {selectedSale.id}</p>
                    <p className="mb-1"><strong>Cliente:</strong> {selectedSale.customer.name}</p>
                    <p className="mb-0"><strong>Monto:</strong> ${selectedSale.totalAmount.toLocaleString('es-MX')}</p>
                  </Alert>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>Método de Pago</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={values.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="cash">Efectivo</option>
                    <option value="credit_card">Tarjeta de Crédito</option>
                    <option value="debit_card">Tarjeta de Débito</option>
                    <option value="transfer">Transferencia</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Referencia de Pago</Form.Label>
                  <Form.Control
                    type="text"
                    name="paymentReference"
                    value={values.paymentReference}
                    onChange={handleChange}
                    placeholder="Número de autorización, últimos 4 dígitos, etc."
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="success" disabled={isSubmitting}>
                  <FontAwesomeIcon icon={faCheck} className="me-1" />
                  {isSubmitting ? 'Procesando...' : 'Confirmar Pago'}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Modal Confirmación de Cancelación de Venta */}
      <Modal show={confirmCancel.show} onHide={handleCloseConfirmCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Cancelación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de que deseas cancelar la venta <strong>#{confirmCancel.sale?.id}</strong>?
          </p>
          <p className="text-danger mb-0">
            <FontAwesomeIcon icon={faTrash} className="me-2" />
            Esta acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmCancel}>
            Volver
          </Button>
          <Button variant="danger" onClick={handleConfirmCancel}>
            Cancelar Venta
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SalesPage;
