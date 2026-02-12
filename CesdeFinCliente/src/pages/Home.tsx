import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <main className="home-hero">
      <section className="container py-4">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-6">
            <div className="welcome-panel">
              <h2 className="mb-4 text-center">Bienvenido al banco</h2>
              <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
                <div className="d-grid gap-2">
                  <Link to="/login">
                    <button className="btn btn-outline-primary">Iniciar sesión</button>
                  </Link>
                  <Link to="/signup">
                    <button className="btn btn-outline-primary">Registrarse</button>
                  </Link>
                </div>
                <div>
                  <img src="/img/atm_illustration.png" alt="Cajero automático" style={{ maxWidth: '72px' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6 d-flex justify-content-center image-panel">
            <img src="/img/humanos_bienvenida.png" alt="Usuarios felices con CesdeFin" className="illustration-human" />
          </div>
        </div>
      </section>
    </main>
  );
};
