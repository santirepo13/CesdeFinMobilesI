import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateForm, authValidationRules } from '../utils/validation';
import { Alert, ErrorMessage, SubmitButton } from '../components/Alert';

export const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  
  const [formData, setFormData] = useState({
    identifier: '',
    clave: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm(formData, {
      identifier: authValidationRules.identifier,
      clave: authValidationRules.clave
    });
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setAlert(null);
    
    try {
      const result = await authLogin(formData.identifier, formData.clave);
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: result.message
        });
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setAlert({
          type: 'error',
          message: result.message
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error al conectar con el servidor'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-grow-1 d-flex justify-content-center align-items-center home-hero">
      <div className="card shadow p-4" 
           style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem' }}>
        <h2 className="mb-4 text-center" style={{ color: '#222' }}>Iniciar Sesión</h2>
        
        {alert && (
          <Alert 
            type={alert.type} 
            message={alert.message}
            className="mb-3"
          />
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="identifier" className="form-label">Usuario o Correo</label>
            <input 
              type="text" 
              className={`form-control ${errors.identifier ? 'is-invalid' : ''}`}
              id="identifier" 
              name="identifier"
              placeholder="Ingrese su usuario o correo" 
              value={formData.identifier}
              onChange={handleChange}
              required 
            />
            <ErrorMessage message={errors.identifier} />
          </div>
          <div className="mb-3">
            <label htmlFor="clave" className="form-label">Clave</label>
            <input 
              type="password" 
              className={`form-control ${errors.clave ? 'is-invalid' : ''}`}
              id="clave" 
              name="clave"
              placeholder="Ingrese su clave" 
              value={formData.clave}
              onChange={handleChange}
              required 
            />
            <ErrorMessage message={errors.clave} />
          </div>
          <div className="d-grid">
            <SubmitButton 
              isSubmitting={isSubmitting}
              text="Entrar"
              loadingText="Iniciando sesión..."
            />
          </div>
        </form>
        <p className="text-center mt-3">
          ¿No tienes cuenta? <Link to="/signup">Regístrate aquí</Link>
        </p>
      </div>
    </main>
  );
};
