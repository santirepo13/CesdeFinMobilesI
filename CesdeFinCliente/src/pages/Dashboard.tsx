export const Dashboard = () => {
  return (
    <main className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Panel Principal</h2>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Bienvenido al Dashboard</h5>
              <p className="card-text">Aquí podrás ver tu saldo y realizar operaciones bancarias.</p>
              <div className="row mt-4">
                <div className="col-md-4">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Saldo Actual</h6>
                      <h3 className="card-title">$0.00</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Última Transacción</h6>
                      <p className="card-text">No hay transacciones</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card text-center">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Estado</h6>
                      <span className="badge bg-success">Activo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};