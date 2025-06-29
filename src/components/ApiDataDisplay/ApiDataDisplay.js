import React, { useState } from 'react';
import { Table, Card, Spinner, Alert, Button, Row, Col, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faTable, faCode } from '@fortawesome/free-solid-svg-icons';

const ApiDataDisplay = ({ 
  title,
  data, 
  loading, 
  error, 
  columns, 
  onRefresh,
  emptyMessage = 'No hay datos disponibles',
}) => {
  const [viewMode, setViewMode] = useState('table');

  // Función para renderizar el valor de una celda basado en su tipo
  const renderCellValue = (item, column) => {
    if (!item) return '';
    
    // Si hay un renderer personalizado para esta columna, usarlo
    if (column.renderer) {
      return column.renderer(item);
    }
    
    // Manejar campos anidados (por ejemplo "customer.name")
    if (column.field.includes('.')) {
      const fields = column.field.split('.');
      let value = item;
      
      for (const field of fields) {
        value = value?.[field];
        if (value === undefined || value === null) break;
      }
      
      return value !== undefined && value !== null ? String(value) : '';
    }
    
    // Caso simple
    const value = item[column.field];
    return value !== undefined && value !== null ? String(value) : '';
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{title}</h5>
          <div>
            <Button 
              size="sm" 
              variant={viewMode === 'table' ? 'primary' : 'outline-primary'} 
              className="me-2"
              onClick={() => setViewMode('table')}
            >
              <FontAwesomeIcon icon={faTable} className="me-1" /> Tabla
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'json' ? 'primary' : 'outline-primary'} 
              className="me-2"
              onClick={() => setViewMode('json')}
            >
              <FontAwesomeIcon icon={faCode} className="me-1" /> JSON
            </Button>
            {onRefresh && (
              <Button 
                size="sm" 
                variant="outline-secondary" 
                onClick={onRefresh} 
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSync} className={loading ? 'fa-spin' : ''} />
              </Button>
            )}
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger">
            {error.message || 'Ha ocurrido un error al cargar los datos'}
          </Alert>
        )}

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando datos...</p>
          </div>
        ) : (
          <>
            {(!data || data.length === 0) ? (
              <div className="text-center my-5">
                <p className="text-muted">{emptyMessage}</p>
              </div>
            ) : (
              viewMode === 'table' ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        {columns.map((column) => (
                          <th key={column.field} style={column.style}>
                            {column.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => (
                        <tr key={item.id || index}>
                          {columns.map((column) => (
                            <td key={`${index}-${column.field}`} style={column.style}>
                              {renderCellValue(item, column)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Form.Control
                  as="textarea"
                  rows={15}
                  readOnly
                  value={JSON.stringify(data, null, 2)}
                  style={{ fontFamily: 'monospace' }}
                />
              )
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ApiDataDisplay;
