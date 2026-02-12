import { useState } from 'react';
import { Link } from 'react-router-dom';

export const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login attempt:', formData);
  };

  return (
    <main className="flex-grow-1 d-flex justify-content-center align-items-center"
          style={{ backgroundImage: "url('/img/fondo_cesdefin.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="card shadow p-4" 
           style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem' }}>
        <h2 className="mb-4 text-center" style={{ color: '#222' }}>Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit}>
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
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Entrar</button>
          </div>
        </form>
        <p className="text-center mt-3">
          ¿No tienes cuenta? <Link to="/signup">Regístrate aquí</Link>
        </p>
      </div>
    </main>
  );
};