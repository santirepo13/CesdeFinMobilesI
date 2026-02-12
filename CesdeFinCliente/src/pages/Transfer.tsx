import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transfer, formatCurrency, validateAmount } from '../services/bankingService';
import { Alert } from '../components/Alert';
import { useAuth } from '../hooks/useAuth';

const Transfer: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [usuarioDestino, setUsuarioDestino] = useState('');
  const [monto, setMonto] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [comision, setComision] = useState(0);
  const [montoTotal, setMontoTotal] = useState(0);

  useEffect(() => {
    if (monto) {
      const validation = validateAmount(monto);
      if (validation.isValid) {
        const montoNum = parseFloat(monto);
        const comisionCalculada = Math.round(montoNum * 0.005); // 0.5% commission for transfers
        setComision(comisionCalculada);
        setMontoTotal(montoNum + comisionCalculada);
      } else {
        setComision(0);
        setMontoTotal(0);
      }
    } else {
      setComision(0);
      setMontoTotal(0);
    }
  }, [monto]);

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMonto(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioDestino.trim()) {
      setAlert({ type: 'error', message: 'El usuario destino es obligatorio' });
      return;
    }

    const validation = validateAmount(monto);
    if (!validation.isValid) {
      setAlert({ type: 'error', message: validation.error });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const montoNum = parseFloat(monto);
      const result = await transfer(usuarioDestino, montoNum);

      if (result.success) {
        setAlert({ type: 'success', message: result.message });
        await refreshUser(); // Refresh user data to update balance
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setAlert({ type: 'error', message: result.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al procesar la transferencia' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pagina d-flex flex-column min-vh-100">
      {/* Header */}
      <header className="navbar navbar-expand-lg shadow-sm py-3" style={{ background: 'linear-gradient(to right, #ffe3f1, #ffcfe6)', borderBottom: '3px solid #ff5ca0' }}>
        <div className="container-fluid px-4">
          <a className="navbar-brand d-flex align-items-center gap-3" href="#" onClick={() => navigate('/dashboard')}>
            <img src="/img/logo_cesdefin_grande.png" alt="Logo CesdeFin" className="logo-grande" style={{ height: '40px' }} />
            <span className="fw-bold fs-3 text-danger">CesdeFin S.A.</span>
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow-1 d-flex justify-content-center align-items-center py-5"
            style={{ backgroundImage: "url('/img/fondo_cesdefin.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            {/* Panel izquierdo: Formulario */}
            <div className="col-lg-6 mb-4">
              <div className="card p-4 shadow" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '1rem' }}>
                <h2 className="mb-4 text-center">Transferir a otro usuario</h2>
                
                {alert && (
                  <Alert
                    type={alert.type}
                    message={alert.message}
                    dismissible={true}
                    onDismiss={() => setAlert(null)}
                  />
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="usuarioDestino" className="form-label">Usuario destino</label>
                    <input
                      type="text"
                      className="form-control"
                      id="usuarioDestino"
                      value={usuarioDestino}
                      onChange={(e) => setUsuarioDestino(e.target.value)}
                      placeholder="nombredeusuario"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="montoTransferir" className="form-label">Monto a transferir</label>
                    <input
                      type="text"
                      className="form-control"
                      id="montoTransferir"
                      value={monto}
                      onChange={handleMontoChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {monto && parseFloat(monto) > 0 && (
                    <div className="mb-3 text-start text-muted small">
                      <div className="d-flex justify-content-between">
                        <span>Monto a transferir:</span>
                        <span>{formatCurrency(parseFloat(monto))}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Comisión (0.5%):</span>
                        <span>{formatCurrency(comision)}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total a debitar:</span>
                        <span>{formatCurrency(montoTotal)}</span>
                      </div>
                    </div>
                  )}

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || !usuarioDestino || !monto || parseFloat(monto) <= 0}
                    >
                      {loading ? 'Procesando...' : 'Transferir'}
                    </button>
                  </div>
                </form>

                <div className="d-grid mt-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Volver al panel
                  </button>
                </div>
              </div>
            </div>

            {/* Panel derecho: Imagen */}
            <div className="col-lg-5 text-center">
              <img src="/img/transfer.png" alt="Transferencia" className="img-fluid" style={{ maxHeight: '400px' }} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-muted py-3" style={{ backgroundColor: '#f0f0f0' }}>
        © 2025 CesdeFin S.A. - Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Transfer;