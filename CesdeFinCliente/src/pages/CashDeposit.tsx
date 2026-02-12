import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cashDeposit, formatCurrency, validateAmount } from '../services/bankingService';
import { Alert } from '../components/Alert';
import QRCode from 'qrcode';
import { useAuth } from '../hooks/useAuth';

const CashDeposit: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [monto, setMonto] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate QR code when amount is entered
    if (monto && parseFloat(monto) > 0) {
      generateQRCode();
    } else {
      setQrCodeUrl('');
    }
  }, [monto]);

  const generateQRCode = async () => {
    try {
      const qrData = `cesdefin:cashdeposit?amount=${monto}&timestamp=${Date.now()}`;
      const url = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

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

    try {
      const montoNum = parseFloat(monto);
      const result = await cashDeposit(montoNum);

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

  return (
    <div className="d-flex justify-content-center align-items-center text-center"
         style={{ minHeight: '85vh', backgroundImage: "url('/img/fondo_cesdefin.png')", backgroundSize: 'cover' }}>
      <div className="card p-5 shadow"
           style={{ width: '100%', maxWidth: '500px', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '1rem' }}>
        <h2 className="mb-3">Depósito en Efectivo</h2>
        <p className="mb-3">Has seleccionado consignar en efectivo. Escanea el código QR para realizar tu pago.</p>

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
            <>
              <div className="mb-3 text-start text-muted">
                <div className="d-flex justify-content-between">
                  <span>Monto a depositar:</span>
                  <span>{formatCurrency(parseFloat(monto))}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Comisión:</span>
                  <span>$0 (Sin comisión)</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total a pagar:</span>
                  <span>{formatCurrency(parseFloat(monto))}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="mb-3" ref={qrRef}>
                <div className="d-flex justify-content-center">
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt="Código QR de pago" 
                      className="border border-2 border-secondary"
                      style={{ width: '200px', height: '200px' }}
                    />
                  ) : (
                    <div 
                      className="border border-2 border-secondary d-flex align-items-center justify-content-center"
                      style={{ width: '200px', height: '200px' }}
                    >
                      <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Generando código QR...</span>
                        </div>
                        <div className="mt-2">
                          <small className="text-muted">Generando código QR...</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center mt-2">
                  <small className="text-muted">Código QR de pago</small>
                </div>
              </div>
            </>
          )}

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading || !monto || parseFloat(monto) <= 0}
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

export default CashDeposit;