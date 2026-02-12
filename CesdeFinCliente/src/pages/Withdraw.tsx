import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { withdraw, formatCurrency, validateAmount } from '../services/bankingService';
import { Alert } from '../components/Alert';
import { useAuth } from '../hooks/useAuth';

const Withdraw: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [monto, setMonto] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawalCode, setWithdrawalCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMonto(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateAmount(monto);
    if (!validation.isValid) {
      setAlert({ type: 'error', message: validation.error });
      return;
    }

    setLoading(true);
    setAlert(null);
    setShowCode(false);
    setWithdrawalCode('');

    try {
      const montoNum = parseFloat(monto);
      const result = await withdraw(montoNum);

      if (result.success) {
        setAlert({ type: 'success', message: result.message });
        if (result.withdrawalCode) {
          setWithdrawalCode(result.withdrawalCode);
          setShowCode(true);
        }
        await refreshUser(); // Refresh user data to update balance
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      } else {
        setAlert({ type: 'error', message: result.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al procesar el retiro' });
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
      <main className="flex-grow-1 d-flex align-items-center" style={{ backgroundImage: "url('/img/fondo_cesdefin.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            {/* Formulario */}
            <div className="col-md-6">
              <div className="card p-4 shadow" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '1rem' }}>
                <h2 className="mb-4 text-center">Retirar fondos</h2>
                
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
                    <label htmlFor="montoRetirar" className="form-label">Monto a retirar</label>
                    <input
                      type="text"
                      className="form-control"
                      id="montoRetirar"
                      value={monto}
                      onChange={handleMontoChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || !monto || parseFloat(monto) <= 0}
                    >
                      {loading ? 'Procesando...' : 'Retirar'}
                    </button>
                  </div>
                </form>

                {showCode && withdrawalCode && (
                  <div className="alert alert-info text-center mt-3">
                    <h5 className="alert-heading">Código de retiro generado</h5>
                    <p className="mb-2">Usa este código para completar tu retiro en el cajero:</p>
                    <div className="display-6 fw-bold text-primary">{withdrawalCode}</div>
                    <small className="text-muted">Este código expirará en 10 minutos</small>
                  </div>
                )}

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

            {/* Imagen */}
            <div className="col-md-6 d-none d-md-block text-center">
              <img src="/img/withdraw.png" alt="Retiro" className="img-fluid" style={{ maxHeight: '420px' }} />
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

export default Withdraw;