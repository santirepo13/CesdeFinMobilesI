import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bankDeposit, formatCurrency, calculateCommission, validateAmount } from '../services/bankingService';
import { Alert } from '../components/Alert';
import { BANK_OPTIONS } from '../types/banks';
import { useAuth } from '../hooks/useAuth';

const BankDeposit: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [banco, setBanco] = useState('');
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
        const comisionCalculada = calculateCommission(montoNum, 'bank');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!banco) {
      setAlert({ type: 'error', message: 'Por favor selecciona un banco' });
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
      const result = await bankDeposit(banco, montoNum);

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
      setAlert({ type: 'error', message: 'Error al procesar el depósito' });
    } finally {
      setLoading(false);
    }
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMonto(value);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center text-center"
         style={{ minHeight: '80vh', backgroundImage: "url('/img/fondo_cesdefin.png')", backgroundSize: 'cover' }}>
      <div className="card p-5 shadow"
           style={{ maxWidth: '500px', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '1rem' }}>
        <h2 className="mb-3">Depósito Bancario</h2>
        <p className="mb-3">Has seleccionado consignar a través de Banco.</p>

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
            <label htmlFor="bancoSeleccionado" className="form-label">Selecciona tu banco</label>
            <select
              id="bancoSeleccionado"
              className="form-select"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              required
            >
              <option disabled value="">-- Selecciona una opción --</option>
              {BANK_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="monto" className="form-label">Monto a depositar</label>
            <input
              type="text"
              id="monto"
              className="form-control"
              value={monto}
              onChange={handleMontoChange}
              placeholder="0.00"
              required
            />
          </div>

          {monto && parseFloat(monto) > 0 && (
            <div className="mb-3 text-start text-muted">
              <div className="d-flex justify-content-between">
                <span>Monto:</span>
                <span>{formatCurrency(parseFloat(monto))}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Comisión (1%):</span>
                <span>{formatCurrency(comision)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total a pagar:</span>
                <span>{formatCurrency(montoTotal)}</span>
              </div>
            </div>
          )}

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading || !banco || !monto || parseFloat(monto) <= 0}
            >
              {loading ? 'Procesando...' : 'Confirmar depósito'}
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
  );
};

export default BankDeposit;