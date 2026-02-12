import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAuthStatus, deleteAccount, type User } from '../services/authService';
import { Alert } from '../components/Alert';

const AccountSettings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authStatus = await checkAuthStatus();
        if (authStatus.authenticated && authStatus.user) {
          setUser(authStatus.user);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleDeleteAccount = async () => {
    // Check if user has balance
    if (user && user.saldo > 0) {
      setAlert({
        type: 'error',
        message: `No puedes eliminar tu cuenta mientras tengas un saldo de $${user.saldo.toLocaleString('es-CO')}. Por favor, transfiere tu saldo a otro usuario antes de eliminar tu cuenta.`
      });
      setTimeout(() => setAlert(null), 5000);
      return;
    }
    
    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.'
    );
    
    if (confirmDelete) {
      setLoading(true);
      try {
        const response = await deleteAccount();
        
        if (response.success) {
          setAlert({ type: 'success', message: response.message });
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setAlert({ type: 'error', message: response.message });
        }
      } catch (error) {
        console.error('Delete account error:', error);
        setAlert({ type: 'error', message: 'Error de conexión al servidor' });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) {
    return (
      <main className="d-flex justify-content-center align-items-center py-5"
            style={{ backgroundImage: "url('/img/fondo_cesdefin.png')", backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando información del usuario...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="py-5"
            style={{ backgroundImage: "url('/img/fondo_cesdefin.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '1rem' }}>
                <div className="card-body p-4">
                  <h2 className="mb-4 text-center">Configuración de Cuenta</h2>
                  
                  {alert && (
                    <Alert
                      type={alert.type}
                      message={alert.message}
                      dismissible={true}
                      onDismiss={() => setAlert(null)}
                    />
                  )}

                  {/* User Information Summary */}
                  <div className="mb-4">
                    <h4 className="mb-3">Información de la Cuenta</h4>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Usuario:</strong> {user.usuario}</p>
                        <p><strong>Nombre:</strong> {user.nombre}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Correo:</strong> {user.correo}</p>
                        <p><strong>Saldo:</strong> ${user.saldo.toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link to="/edit-profile" className="btn btn-outline-primary me-2">
                        Editar Perfil
                      </Link>
                      <Link to="/change-password" className="btn btn-outline-secondary">
                        Cambiar Contraseña
                      </Link>
                    </div>
                  </div>

                  <hr />

                  {/* Account Actions */}
                  <div className="mb-4">
                    <h4 className="mb-3">Acciones de Cuenta</h4>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-info" onClick={() => navigate('/history')}>
                        Ver Historial de Transacciones
                      </button>
                      <button className="btn btn-outline-warning" onClick={() => navigate('/contact')}>
                        Contactar Soporte
                      </button>
                    </div>
                  </div>

                  <hr />

                  {/* Danger Zone */}
                  <div className="mb-4">
                    <h4 className="mb-3 text-danger">Zona de Peligro</h4>
                    <p className="text-muted">
                      Estas acciones son permanentes y no se pueden deshacer.
                    </p>
                    <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={loading}>
                      {loading ? 'Eliminando...' : 'Eliminar Cuenta'}
                    </button>
                  </div>

                  <div className="text-center mt-4">
                    <Link to="/dashboard" className="btn btn-secondary">
                      Volver al Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
};

export default AccountSettings;