import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { changePassword, checkAuthStatus, validatePassword, getPasswordValidationError } from '../services/authService';
import { Alert, ErrorMessage } from '../components/Alert';

const ChangePassword: React.FC = () => {
  const [claveActual, setClaveActual] = useState('');
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await checkAuthStatus();
        if (!authStatus.authenticated) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (nuevaClave) {
      const error = getPasswordValidationError(nuevaClave);
      setValidationError(error);
    } else {
      setValidationError('');
    }
  }, [nuevaClave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    // Validation
    if (!claveActual || !nuevaClave || !confirmarClave) {
      setAlert({ type: 'error', message: 'Todos los campos son obligatorios' });
      setLoading(false);
      return;
    }

    if (nuevaClave !== confirmarClave) {
      setAlert({ type: 'error', message: 'Las contraseñas nuevas no coinciden' });
      setLoading(false);
      return;
    }

    if (!validatePassword(nuevaClave)) {
      setAlert({ type: 'error', message: 'La nueva contraseña no cumple con los requisitos de seguridad' });
      setLoading(false);
      return;
    }

    try {
      const response = await changePassword(claveActual, nuevaClave);
      
      if (response.success) {
        setAlert({ type: 'success', message: 'Contraseña actualizada exitosamente' });
        // Clear form
        setClaveActual('');
        setNuevaClave('');
        setConfirmarClave('');
        setValidationError('');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setAlert({ type: 'error', message: response.message });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setAlert({ type: 'error', message: 'Error de conexión al servidor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="d-flex justify-content-center align-items-center py-5"
            style={{ backgroundImage: "url('/img/fondo_cesdefin.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="card p-4 shadow" style={{ width: '100%', maxWidth: '450px', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '1rem' }}>
          <h2 className="mb-4 text-center">Cambiar Contraseña</h2>
          
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
              <label htmlFor="claveActual" className="form-label">Contraseña Actual</label>
              <input
                type="password"
                className="form-control"
                id="claveActual"
                value={claveActual}
                onChange={(e) => setClaveActual(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="nuevaClave" className="form-label">Nueva Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="nuevaClave"
                value={nuevaClave}
                onChange={(e) => setNuevaClave(e.target.value)}
                required
              />
              <ErrorMessage message={validationError} />
              <small className="form-text text-muted">
                La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos
              </small>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmarClave" className="form-label">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="confirmarClave"
                value={confirmarClave}
                onChange={(e) => setConfirmarClave(e.target.value)}
                required
              />
              {confirmarClave && nuevaClave && confirmarClave !== nuevaClave && (
                <ErrorMessage message="Las contraseñas no coinciden" />
              )}
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary" disabled={loading || !!validationError}>
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </form>

          <div className="mt-3 text-center">
            <Link to="/dashboard" className="btn btn-outline-secondary">
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </main>
  );
};

export default ChangePassword;