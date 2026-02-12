import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { updateProfile, updateUsername, checkAuthStatus, type User } from '../services/authService';
import { Alert } from '../components/Alert';

const EditProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [nuevoUsuario, setNuevoUsuario] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authStatus = await checkAuthStatus();
        if (authStatus.authenticated && authStatus.user) {
          setUser(authStatus.user);
          setNombre(authStatus.user.nombre);
          setCorreo(authStatus.user.correo);
          setNuevoUsuario(authStatus.user.usuario);
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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const response = await updateProfile(correo);
      
      if (response.success) {
        setAlert({ type: 'success', message: 'Perfil actualizado exitosamente' });
        if (response.user) {
          setUser(response.user);
        }
      } else {
        setAlert({ type: 'error', message: response.message });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({ type: 'error', message: 'Error de conexión al servidor' });
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    if (nuevoUsuario.trim().length < 3) {
      setAlert({ type: 'error', message: 'El nombre de usuario debe tener al menos 3 caracteres' });
      setLoading(false);
      return;
    }

    try {
      const response = await updateUsername(nuevoUsuario.trim());
      
      if (response.success) {
        setAlert({ type: 'success', message: 'Nombre de usuario actualizado exitosamente' });
        if (response.user) {
          setUser(response.user);
        }
      } else {
        setAlert({ type: 'error', message: response.message });
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setAlert({ type: 'error', message: 'Error de conexión al servidor' });
    } finally {
      setLoading(false);
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
    <main className="d-flex justify-content-center align-items-center py-5"
            style={{ backgroundImage: "url('/img/fondo_cesdefin.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card p-4 shadow" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '1rem' }}>
                <h2 className="mb-4 text-center">Editar Perfil</h2>
                
                {alert && (
                  <Alert
                    type={alert.type}
                    message={alert.message}
                    dismissible={true}
                    onDismiss={() => setAlert(null)}
                  />
                )}

                {/* Profile Information Form */}
                <form onSubmit={handleProfileUpdate} className="mb-4">
                  <h4 className="mb-3">Información Personal</h4>
                  
                  <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre completo</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombre"
                      value={nombre}
                      readOnly
                      disabled
                    />
                    <small className="form-text text-muted">
                      El nombre completo no se puede editar después de la creación de la cuenta
                    </small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="correo" className="form-label">Correo electrónico</label>
                    <input
                      type="email"
                      className="form-control"
                      id="correo"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Actualizando...' : 'Actualizar Información'}
                    </button>
                  </div>
                </form>

                <hr />

                {/* Username Update Form */}
                <form onSubmit={handleUsernameUpdate}>
                  <h4 className="mb-3">Nombre de Usuario</h4>
                  
                  <div className="mb-3">
                    <label htmlFor="nuevoUsuario" className="form-label">Nuevo nombre de usuario</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nuevoUsuario"
                      value={nuevoUsuario}
                      onChange={(e) => setNuevoUsuario(e.target.value)}
                      required
                    />
                    <small className="form-text text-muted">
                      Actual: {user.usuario}
                    </small>
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn btn-secondary" disabled={loading}>
                      {loading ? 'Actualizando...' : 'Actualizar Usuario'}
                    </button>
                  </div>
                </form>

                <div className="mt-4 text-center">
                  <Link to="/dashboard" className="btn btn-outline-secondary me-2">
                    Volver al Dashboard
                  </Link>
                  <Link to="/change-password" className="btn btn-outline-primary">
                    Cambiar Contraseña
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
};

export default EditProfile;