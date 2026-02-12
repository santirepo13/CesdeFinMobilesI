import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardDeposit, formatCurrency, calculateCommission, validateAmount, validateCardNumber, validateCVV, validateExpiryDate } from '../services/bankingService';
import { Alert } from '../components/Alert';
import { useAuth } from '../hooks/useAuth';

const CardDeposit: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [cvv, setCvv] = useState('');
  const [monto, setMonto] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [comision, setComision] = useState(0);
  const [montoTotal, setMontoTotal] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (monto) {
      const validation = validateAmount(monto);
      if (validation.isValid) {
        const montoNum = parseFloat(monto);
        const comisionCalculada = calculateCommission(montoNum, 'card');
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
      setErrors({ ...errors, monto: '' });
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) {
      // Format with spaces every 4 digits
      const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      setNumeroTarjeta(formatted);
      setErrors({ ...errors, numeroTarjeta: '' });
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      if (value.length >= 3) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
      setFechaExpiracion(value);
      setErrors({ ...errors, fechaExpiracion: '' });
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvv(value);
      setErrors({ ...errors, cvv: '' });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate amount
    const amountValidation = validateAmount(monto);
    if (!amountValidation.isValid) {
      newErrors.monto = amountValidation.error;
    }

    // Validate card number
    const cardValidation = validateCardNumber(numeroTarjeta);
    if (!cardValidation.isValid) {
      newErrors.numeroTarjeta = cardValidation.error;
    }

    // Validate name
    if (!nombreTarjeta.trim()) {
      newErrors.nombreTarjeta = 'El nombre en la tarjeta es obligatorio';
    }

    // Validate expiry date
    const expiryValidation = validateExpiryDate(fechaExpiracion);
    if (!expiryValidation.isValid) {
      newErrors.fechaExpiracion = expiryValidation.error;
    }

    // Validate CVV
    const cvvValidation = validateCVV(cvv);
    if (!cvvValidation.isValid) {
      newErrors.cvv = cvvValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const montoNum = parseFloat(monto);
      const result = await cardDeposit(
        numeroTarjeta.replace(/\s/g, ''),
        nombreTarjeta,
        fechaExpiracion,
        cvv,
        montoNum
      );

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
        <h2 className="mb-4">Depósito con Tarjeta</h2>
        <p className="mb-3">Has seleccionado consignar con Tarjeta.</p>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            dismissible={true}
            onDismiss={() => setAlert(null)}
          />
        )}

        {monto && parseFloat(monto) > 0 && (
          <div className="mb-3 text-start text-muted">
            <div className="d-flex justify-content-between">
              <span>Monto:</span>
              <span>{formatCurrency(parseFloat(monto))}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Comisión (2.5%):</span>
              <span>{formatCurrency(comision)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total a pagar:</span>
              <span>{formatCurrency(montoTotal)}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label htmlFor="monto" className="form-label">Monto a depositar</label>
            <input
              type="text"
              id="monto"
              className={`form-control ${errors.monto ? 'is-invalid' : ''}`}
              value={monto}
              onChange={handleMontoChange}
              placeholder="0.00"
              required
            />
            {errors.monto && <div className="invalid-feedback">{errors.monto}</div>}
          </div>

          <div className="mb-3 text-start">
            <label htmlFor="numeroTarjeta" className="form-label">Número de tarjeta</label>
            <input
              type="text"
              id="numeroTarjeta"
              className={`form-control ${errors.numeroTarjeta ? 'is-invalid' : ''}`}
              value={numeroTarjeta}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
            {errors.numeroTarjeta && <div className="invalid-feedback">{errors.numeroTarjeta}</div>}
          </div>

          <div className="mb-3 text-start">
            <label htmlFor="nombreTarjeta" className="form-label">Nombre en la tarjeta</label>
            <input
              type="text"
              id="nombreTarjeta"
              className={`form-control ${errors.nombreTarjeta ? 'is-invalid' : ''}`}
              value={nombreTarjeta}
              onChange={(e) => setNombreTarjeta(e.target.value)}
              placeholder="JUAN PEREZ"
              required
            />
            {errors.nombreTarjeta && <div className="invalid-feedback">{errors.nombreTarjeta}</div>}
          </div>

          <div className="mb-3 text-start">
            <label htmlFor="fechaExpiracion" className="form-label">Fecha de expiración (MM/AA)</label>
            <input
              type="text"
              id="fechaExpiracion"
              className={`form-control ${errors.fechaExpiracion ? 'is-invalid' : ''}`}
              value={fechaExpiracion}
              onChange={handleExpiryDateChange}
              placeholder="12/25"
              maxLength={5}
              required
            />
            {errors.fechaExpiracion && <div className="invalid-feedback">{errors.fechaExpiracion}</div>}
          </div>

          <div className="mb-4 text-start">
            <label htmlFor="cvvTarjeta" className="form-label">CVV</label>
            <input
              type="text"
              id="cvvTarjeta"
              className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
              value={cvv}
              onChange={handleCvvChange}
              placeholder="123"
              maxLength={3}
              required
            />
            {errors.cvv && <div className="invalid-feedback">{errors.cvv}</div>}
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Confirmar pago'}
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

export default CardDeposit;