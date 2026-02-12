import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export const Header = () => {
  const location = useLocation();
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavToggle = () => {
    setIsNavExpanded(!isNavExpanded);
  };

  const handleLinkClick = () => {
    setIsNavExpanded(false);
  };

  return (
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
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/services') ? 'active' : ''}`} to="/services" onClick={handleLinkClick}>Servicios</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/contact') ? 'active' : ''}`} to="/contact" onClick={handleLinkClick}>Contacto</Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
