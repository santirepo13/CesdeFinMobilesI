import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      setBalance(user.saldo);
    }
  }, [user]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <main className="container-fluid py-4">
        <div className="row">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main 
      style={{ 
        backgroundImage: "url('/img/fondo_cesdefin.png')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }} 
      className="py-5"
    >
      <div className="container text-center text-dark">
        <h2 className="mb-4">Bienvenido, {user.nombre} 👋</h2>

        {/* Balance Card */}
        <div className="mb-5">
          <div className="card mx-auto" style={{ maxWidth: '400px' }}>
            <div className="card-body">
              <h5 className="card-title">Saldo actual</h5>
              <p className="card-text fs-4 text-success">{formatCurrency(balance)}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row g-4 justify-content-center">
          <div className="col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column justify-content-center">
                <h5 className="card-title">Consignar</h5>
                <p className="card-text">Añadir dinero a tu cuenta.</p>
                <button 
                  onClick={() => navigate('/deposit')}
                  className="btn btn-primary mt-auto w-100"
                >
                  Consignar
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column justify-content-center">
                <h5 className="card-title">Retirar</h5>
                <p className="card-text">Retira dinero de tu cuenta.</p>
                <button 
                  onClick={() => navigate('/withdraw')}
                  className="btn btn-primary mt-auto w-100"
                >
                  Retirar
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column justify-content-center">
                <h5 className="card-title">Transferir</h5>
                <p className="card-text">Enviar dinero a otro usuario.</p>
                <button 
                  onClick={() => navigate('/transfer')}
                  className="btn btn-primary mt-auto w-100"
                >
                  Transferir
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column justify-content-center">
                <h5 className="card-title">Movimientos</h5>
                <p className="card-text">Consulta tus transacciones.</p>
                <button 
                  onClick={() => navigate('/history')}
                  className="btn btn-primary mt-auto w-100"
                >
                  Ver movimientos
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column justify-content-center">
                <h5 className="card-title">Editar usuario</h5>
                <p className="card-text">Cambiar tu nombre de usuario.</p>
                <button 
                  onClick={() => navigate('/edit-user')}
                  className="btn btn-secondary mt-auto w-100"
                >
                  Cambiar nombre
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column justify-content-center">
                <h5 className="card-title">Cambiar clave</h5>
                <p className="card-text">Actualiza tu contraseña.</p>
                <button 
                  onClick={() => navigate('/change-password')}
                  className="btn btn-secondary mt-auto w-100"
                >
                  Cambiar clave
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};