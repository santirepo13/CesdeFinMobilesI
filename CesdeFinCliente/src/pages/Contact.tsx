export const Contact = () => {
  return (
    <main className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Contacto</h2>
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h5>Información de Contacto</h5>
                  <p><strong>Dirección:</strong> Calle Principal #123</p>
                  <p><strong>Teléfono:</strong> +57 1 234 5678</p>
                  <p><strong>Correo:</strong> info@cesdefin.com</p>
                  <p><strong>Horario:</strong> Lunes a Viernes 8:00 AM - 6:00 PM</p>
                </div>
                <div className="col-md-6">
                  <h5>Envíanos un mensaje</h5>
                  <form>
                    <div className="mb-3">
                      <label htmlFor="contactName" className="form-label">Nombre</label>
                      <input type="text" className="form-control" id="contactName" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="contactEmail" className="form-label">Correo</label>
                      <input type="email" className="form-control" id="contactEmail" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="contactMessage" className="form-label">Mensaje</label>
                      <textarea className="form-control" id="contactMessage" rows={4}></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Enviar Mensaje</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};