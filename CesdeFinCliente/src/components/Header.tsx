import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Alert } from './Alert';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavToggle = () => {
    setIsNavExpanded(!isNavExpanded);
  };

  const handleLinkClick = () => {
    setIsNavExpanded(false);
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        setAlert({
          type: 'success',
          message: result.message
        });
        navigate('/login');
      } else {
        setAlert({
          type: 'error',
          message: result.message
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error al cerrar sesión'
      });
    }
    handleLinkClick();
  };

  return (
    <>
      {alert && (
        <div className="position-fixed top-0 start-50 translate-middle-x" style={{ zIndex: 1050, marginTop: '10px' }}>
          <Alert 
            type={alert.type} 
            message={alert.message}
            dismissible
            onDismiss={() => setAlert(null)}
          />
        </div>
      )}
      <header className="navbar navbar-expand-lg shadow-sm py-1" style={{ background: 'linear-gradient(to right, #ffe3f1, #ffcfe6)', borderBottom: '3px solid #ff5ca0' }}>
        <div className="container-fluid px-2">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={handleLinkClick}>
            <img src="/img/logo_cesdefin_grande.png" alt="Logo CesdeFin" className="logo-grande" />
            <span className="fw-bold text-danger d-none d-md-inline">CesdeFin S.A.</span>
            <span className="fw-bold text-danger d-md-none">CesdeFin</span>
          </Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded={isNavExpanded}
            aria-label="Toggle navigation"
            onClick={handleNavToggle}
            style={{ border: '2px solid #ff5ca0', color: '#e60073' }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse justify-content-end ${isNavExpanded ? 'show' : ''}`} id="navbarContent">
            <ul className="navbar-nav text-center">
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} to="/" onClick={handleLinkClick}>Inicio</Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard" onClick={handleLinkClick}>Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/services') ? 'active' : ''}`} to="/services" onClick={handleLinkClick}>Servicios</Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/contact') ? 'active' : ''}`} to="/contact" onClick={handleLinkClick}>Contacto</Link>
                  </li>
                  <li className="nav-item dropdown">
                    <a 
                      className="nav-link dropdown-toggle d-flex align-items-center gap-1" 
                      href="#" 
                      role="button" 
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                    >
                      <i className="bi bi-person-circle"></i>
                      <span className="d-none d-md-inline">{user?.nombre}</span>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><h6 className="dropdown-header">{user?.nombre}</h6></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><span className="dropdown-item-text">Saldo: ${user?.saldo?.toFixed(2) || '0.00'}</span></li>
                      <li><span className="dropdown-item-text">Usuario: {user?.usuario}</span></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item" onClick={handleLogout}>
                          <i className="bi bi-box-arrow-right me-2"></i>
                          Cerrar Sesión
                        </button>
                      </li>
                    </ul>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/login') ? 'active' : ''}`} to="/login" onClick={handleLinkClick}>Iniciar Sesión</Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/signup') ? 'active' : ''}`} to="/signup" onClick={handleLinkClick}>Registrarse</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </header>
    </>
  );
};
