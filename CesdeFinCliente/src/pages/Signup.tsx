import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateForm, registrationValidationRules, validatePasswordMatch } from '../utils/validation';
import { Alert, ErrorMessage, SubmitButton } from '../components/Alert';

export const Signup = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    correo: '',
    clave: '',
    confirmPassword: ''
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
    const validationErrors = validateForm(formData, registrationValidationRules);
    
    // Check password match
    const passwordMatchError = validatePasswordMatch(formData.clave, formData.confirmPassword);
    if (passwordMatchError) {
      validationErrors.confirmPassword = passwordMatchError;
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setAlert(null);
    
    try {
      const result = await authRegister(
        formData.usuario,
        formData.clave,
        formData.nombre,
        formData.correo
      );
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: result.message
        });
        
        // Redirect to dashboard after successful registration
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
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
    <main className="flex-grow-1 d-flex justify-content-center align-items-center"
          style={{ backgroundImage: "url('/img/fondo_cesdefin.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="card shadow p-4" 
           style={{ width: '100%', maxWidth: '500px', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem' }}>
        <h2 className="mb-4 text-center" style={{ color: '#222' }}>Registrarse</h2>
        
        {alert && (
          <Alert 
            type={alert.type} 
            message={alert.message}
            className="mb-3"
          />
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label">Nombre Completo</label>
            <input 
              type="text" 
              className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
              id="nombre" 
              name="nombre"
              placeholder="Ingrese su nombre completo" 
              value={formData.nombre}
              onChange={handleChange}
              required 
            />
            <ErrorMessage message={errors.nombre} />
          </div>
          <div className="mb-3">
            <label htmlFor="usuario" className="form-label">Usuario</label>
            <input 
              type="text" 
              className={`form-control ${errors.usuario ? 'is-invalid' : ''}`}
              id="usuario" 
              name="usuario"
              placeholder="Cree su usuario" 
              value={formData.usuario}
              onChange={handleChange}
              required 
            />
            <ErrorMessage message={errors.usuario} />
          </div>
          <div className="mb-3">
            <label htmlFor="correo" className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
              id="correo" 
              name="correo"
              placeholder="correo@ejemplo.com" 
              value={formData.correo}
              onChange={handleChange}
              required 
            />
            <ErrorMessage message={errors.correo} />
          </div>
          <div className="mb-3 position-relative">
            <label htmlFor="clave" className="form-label d-flex align-items-center gap-2">
              Contraseña
              <span className="info-icon" tabIndex={0} style={{ cursor: 'pointer', color: '#6c757d' }}>
                ❓
                <div className="position-absolute start-0 top-100 mt-1 p-2 bg-white border rounded shadow-sm" 
                     style={{ zIndex: 10, fontSize: '0.875rem', minWidth: '250px', display: 'none' }}
                     onMouseEnter={(e) => e.currentTarget.style.display = 'block'}
                     onMouseLeave={(e) => e.currentTarget.style.display = 'none'}>
                  <ul className="mb-0">
                    <li>Mínimo 8 caracteres</li>
                    <li>Una letra mayúscula</li>
                    <li>Una letra minúscula</li>
                    <li>Un número</li>
                    <li>Un carácter especial (!, @, #, etc.)</li>
                  </ul>
                </div>
              </span>
            </label>
            <input 
              type="password" 
              className={`form-control ${errors.clave ? 'is-invalid' : ''}`}
              id="clave" 
              name="clave"
              placeholder="Cree una clave segura" 
              value={formData.clave}
              onChange={handleChange}
              required 
            />
            <ErrorMessage message={errors.clave} />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
            <input 
              type="password" 
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              id="confirmPassword" 
              name="confirmPassword"
              placeholder="Confirme su contraseña" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
            <ErrorMessage message={errors.confirmPassword} />
          </div>
          <div className="d-grid">
            <SubmitButton 
              isSubmitting={isSubmitting}
              text="Registrarse"
              loadingText="Registrando..."
            />
          </div>
        </form>
        <p className="text-center mt-3">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </main>
  );
};