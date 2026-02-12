// Authentication middleware to protect routes
function authenticate(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            error: 'No autenticado',
            message: 'Debe iniciar sesión para acceder a este recurso'
        });
    }
    
    // Add user to request object for easy access in routes
    req.user = req.session.user;
    next();
}

// Optional authentication - doesn't fail if not authenticated
function optionalAuth(req, res, next) {
    if (req.session.user) {
        req.user = req.session.user;
    }
    next();
}

module.exports = {
    authenticate,
    optionalAuth
};