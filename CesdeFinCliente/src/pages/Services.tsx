export const Services = () => {
  return (
    <main className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Nuestros Servicios</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">Depósitos</h5>
                  <p className="card-text">Realiza depósitos bancarios, con tarjeta o en efectivo con comisiones competitivas.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">Retiros</h5>
                  <p className="card-text">Retira tu dinero de forma segura con códigos generados automáticamente.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h5 className="card-title">Transferencias</h5>
                  <p className="card-text">Transfiere dinero a otros usuarios de forma rápida y segura.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};