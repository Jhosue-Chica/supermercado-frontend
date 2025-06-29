import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faBox, faUsers, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { getSalesStats, getProducts } from '../../services/api';
import ApiDataDisplay from '../../components/ApiDataDisplay/ApiDataDisplay';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Definición de columnas para la tabla de productos más vendidos
  const topProductsColumns = [
    { field: 'productName', header: 'Producto' },
    { field: 'quantity', header: 'Unidades Vendidas' },
    { 
      field: 'totalSold', 
      header: 'Importe', 
      renderer: (item) => `$${item.totalSold.toLocaleString('es-MX')}`
    }
  ];

  // Definición de columnas para la tabla de productos con poco stock
  const lowStockProductsColumns = [
    { field: 'name', header: 'Producto' },
    { field: 'code', header: 'Código' },
    { field: 'category', header: 'Categoría' },
    { field: 'stock', header: 'Stock Disponible' },
    { 
      field: 'price', 
      header: 'Precio', 
      renderer: (item) => `$${item.price.toLocaleString('es-MX')}`
    }
  ];

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Cargar estadísticas de ventas
        const statsResponse = await getSalesStats();
        setStats(statsResponse.data);
        setTopProducts(statsResponse.data.topProducts || []);
        
        // Cargar productos con poco stock
        const productsResponse = await getProducts();
        const lowStock = productsResponse.data
          .filter(product => product.stock <= 10)
          .sort((a, b) => a.stock - b.stock);
          
        setLowStockProducts(lowStock);
      } catch (err) {
        setError(err.message || 'Error al cargar los datos del dashboard');
        console.error('Error en dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Información para las tarjetas de estadísticas
  const statCards = [
    {
      title: 'Ventas Totales',
      value: stats?.summary?.totalSales || 0,
      icon: faShoppingCart,
      color: 'primary'
    },
    {
      title: 'Ingresos',
      value: `$${(stats?.summary?.totalRevenue || 0).toLocaleString('es-MX')}`,
      icon: faDollarSign,
      color: 'success'
    },
    {
      title: 'Venta Promedio',
      value: `$${(stats?.summary?.averageSaleAmount || 0).toLocaleString('es-MX')}`,
      icon: faShoppingCart,
      color: 'info'
    },
    {
      title: 'Productos con Poco Stock',
      value: lowStockProducts.length,
      icon: faBox,
      color: lowStockProducts.length > 0 ? 'warning' : 'success'
    }
  ];

  // Si hay un error cargando los datos
  if (error && !loading) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          Error al cargar los datos del dashboard: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Dashboard</h2>
      
      {/* Tarjetas de estadísticas */}
      <Row className="g-4 mb-4">
        {statCards.map((card, index) => (
          <Col key={index} xs={12} md={6} lg={3}>
            <Card className={`shadow-sm border-${card.color} border-start border-4`}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-0">{card.title}</h6>
                    <h3 className="mt-1 mb-0">{card.value}</h3>
                  </div>
                  <div>
                    <FontAwesomeIcon 
                      icon={card.icon} 
                      size="2x" 
                      className={`text-${card.color} opacity-50`}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Productos más vendidos */}
      <Row className="mb-4">
        <Col>
          <ApiDataDisplay 
            title="Productos Más Vendidos"
            data={topProducts}
            loading={loading}
            error={error}
            columns={topProductsColumns}
            emptyMessage="No hay datos de ventas disponibles"
          />
        </Col>
      </Row>
      
      {/* Productos con poco stock */}
      <Row>
        <Col>
          <ApiDataDisplay 
            title="Productos con Poco Stock"
            data={lowStockProducts}
            loading={loading}
            error={error}
            columns={lowStockProductsColumns}
            emptyMessage="No hay productos con stock bajo"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
