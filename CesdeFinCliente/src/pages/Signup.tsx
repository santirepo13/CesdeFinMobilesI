import { useState } from 'react';
import { Link } from 'react-router-dom';

export const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    initialBalance: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement signup logic
    console.log('Signup attempt:', formData);
  };

  return (
    <main className="flex-grow-1 d-flex justify-content-center align-items-center"
          style={{ backgroundImage: "url('/img/fondo_cesdefin.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="card shadow p-4" 
           style={{ width: '100%', maxWidth: '500px', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem' }}>
        <h2 className="mb-4 text-center" style={{ color: '#222' }}>Registrarse</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="fullName" className="form-label">Nombre Completo</label>
            <input 
              type="text" 
              className="form-control" 
              id="fullName" 
              name="fullName"
              placeholder="Ingrese su nombre completo" 
              value={formData.fullName}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input 
              type="text" 
              className="form-control" 
              id="username" 
              name="username"
              placeholder="Ingrese su usuario" 
              value={formData.username}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="form-control" 
              id="email" 
              name="email"
              placeholder="Ingrese su correo" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Clave</label>
            <input 
              type="password" 
              className="form-control" 
              id="password" 
              name="password"
              placeholder="Ingrese su clave" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirmar Clave</label>
            <input 
              type="password" 
              className="form-control" 
              id="confirmPassword" 
              name="confirmPassword"
              placeholder="Confirme su clave" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="initialBalance" className="form-label">Saldo Inicial</label>
            <input 
              type="number" 
              className="form-control" 
              id="initialBalance" 
              name="initialBalance"
              placeholder="Ingrese saldo inicial" 
              value={formData.initialBalance}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Registrarse</button>
          </div>
        </form>
        <p className="text-center mt-3">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </main>
  );
};