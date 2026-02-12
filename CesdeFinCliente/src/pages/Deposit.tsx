import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';

const Deposit: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-center align-items-center text-center"
         style={{ minHeight: '80vh', backgroundImage: "url('/img/fondo_cesdefin.png')", backgroundSize: 'cover' }}>
      <div className="card p-5 shadow"
           style={{ maxWidth: '600px', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '1rem' }}>
        <h2 className="mb-4">Seleccionar método de consignación</h2>
        <p className="mb-4">Elige cómo deseas consignar dinero a tu cuenta.</p>

        <div className="row g-3">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Banco</h5>
                <p className="card-text">Consigna desde cualquier banco con comisión del 1%</p>
                <button 
                  onClick={() => navigate('/deposit/bank')}
                  className="btn btn-primary mt-auto"
                >
                  Consignar con banco
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Tarjeta</h5>
                <p className="card-text">Usa tu tarjeta de crédito o débito con comisión del 2.5%</p>
                <button 
                  onClick={() => navigate('/deposit/card')}
                  className="btn btn-primary mt-auto"
                >
                  Consignar con tarjeta
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Efectivo</h5>
                <p className="card-text">Consigna en efectivo sin comisión usando código QR</p>
                <button 
                  onClick={() => navigate('/deposit/cash')}
                  className="btn btn-primary mt-auto"
                >
                  Consignar en efectivo
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="d-grid mt-4">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Volver al panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Deposit;