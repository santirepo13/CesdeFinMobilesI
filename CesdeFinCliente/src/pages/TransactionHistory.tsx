import React, { useState, useEffect } from 'react';
import { getTransactionHistory, exportTransactionsToCSV, formatCurrency } from '../services/bankingService';
import type { Transaction, TransactionFilters } from '../services/bankingService';

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({
    limit: 20,
    offset: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactionHistory(filters);
      
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
        setError('');
      } else {
        setError(response.error || 'Error al cargar el historial de transacciones');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
  };

  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  const handleExport = () => {
    const csv = exportTransactionsToCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTransactionTypeClass = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'consignación':
      case 'consignacion':
        return 'text-success';
      case 'retiro':
        return 'text-danger';
      case 'transferencia':
        return 'text-info';
      default:
        return 'text-secondary';
    }
  };

  const getTransactionIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'consignación':
      case 'consignacion':
        return '↓';
      case 'retiro':
        return '↑';
      case 'transferencia':
        return '⇄';
      default:
        return '•';
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando historial de transacciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Historial de Movimientos</h2>
            </div>
            <div className="card-body">
              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <label htmlFor="tipoFiltro" className="form-label">Tipo de movimiento</label>
                  <select
                    className="form-select"
                    id="tipoFiltro"
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange({ type: e.target.value || undefined })}
                  >
                    <option value="">Todos</option>
                    <option value="consignación">Consignación</option>
                    <option value="retiro">Retiro</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="fechaFiltro" className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fechaFiltro"
                    value={filters.date || ''}
                    onChange={(e) => handleFilterChange({ date: e.target.value || undefined })}
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary me-2"
                    onClick={() => setFilters({ limit: 20, offset: 0 })}
                  >
                    Limpiar Filtros
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleExport}
                    disabled={transactions.length === 0}
                  >
                    Exportar CSV
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Transactions List */}
              {transactions.length === 0 ? (
                <div className="alert alert-warning" role="alert">
                  No se encontraron movimientos.
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Fecha</th>
                          <th>Tipo</th>
                          <th>Monto</th>
                          <th>Comisión</th>
                          <th>Método</th>
                          <th>Detalle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction, index) => (
                          <tr key={index}>
                            <td>
                              <small className="text-muted">
                                {new Date(transaction.fecha).toLocaleString('es-CO')}
                              </small>
                            </td>
                            <td>
                              <span className={`fw-bold ${getTransactionTypeClass(transaction.tipo)}`}>
                                {getTransactionIcon(transaction.tipo)} {transaction.tipo}
                              </span>
                            </td>
                            <td className={getTransactionTypeClass(transaction.tipo)}>
                              <strong>
                                {formatCurrency(Math.abs(transaction.valor || transaction.monto))}
                              </strong>
                            </td>
                            <td>
                              {transaction.comision && transaction.comision > 0 ? (
                                <span className="text-warning">
                                  {formatCurrency(transaction.comision)}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {transaction.metodo ? (
                                <span className="badge bg-secondary">{transaction.metodo}</span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <small className="text-muted">
                                {transaction.detalle || transaction.descripcion || '-'}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.total > pagination.limit && (
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <div className="text-muted">
                        Mostrando {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} 
                        {' '}de {pagination.total} transacciones
                      </div>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                          disabled={pagination.offset === 0}
                        >
                          Anterior
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                          disabled={!pagination.hasMore}
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Back to Dashboard Button */}
              <div className="d-grid mt-4">
                <a href="/dashboard" className="btn btn-secondary">
                  Volver al Panel
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;