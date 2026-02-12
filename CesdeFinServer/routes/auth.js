const express = require('express');
const router = express.Router();
const { userHelpers } = require('../models/User');

// Password validation middleware
function validatePassword(req, res, next) {
    const { clave } = req.body;
    
    if (!clave) {
        return res.status(400).json({
            error: 'La contraseña es obligatoria'
        });
    }
    
    // Password validation: 8+ chars, uppercase, lowercase, numbers, symbols
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(clave)) {
        return res.status(400).json({
            error: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos'
        });
    }
    
    next();
}

// User registration endpoint
router.post('/register', validatePassword, async (req, res) => {
    const { usuario, clave, nombre, correo } = req.body;
    
    try {
        // Check if user already exists
        const existingUser = await req.db.collection('users').findOne({
            $or: [
                { usuario: usuario },
                { correo: correo }
            ]
        });
        
        if (existingUser) {
            return res.status(400).json({
                error: existingUser.usuario === usuario ? 'El usuario ya existe' : 'El correo ya está registrado'
            });
        }
        
        // Create new user
        const newUser = {
            usuario,
            clave, // Note: In production, this should be hashed
            nombre,
            correo,
            saldo: 0,
            movimientos: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await req.db.collection('users').insertOne(newUser);
        
        // Store user session
        req.session.user = {
            id: result.insertedId,
            usuario: newUser.usuario,
            nombre: newUser.nombre,
            correo: newUser.correo,
            saldo: newUser.saldo
        };
        
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: {
                id: result.insertedId,
                usuario: newUser.usuario,
                nombre: newUser.nombre,
                correo: newUser.correo,
                saldo: newUser.saldo
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Error al registrar usuario'
        });
    }
});

// User login endpoint
router.post('/login', async (req, res) => {
    const { identifier, clave } = req.body;
    
    if (!identifier || !clave) {
        return res.status(400).json({
            error: 'Usuario/Correo y contraseña son obligatorios'
        });
    }
    
    try {
        // Find user by username or email
        const user = await req.db.collection('users').findOne(
            userHelpers.findByUsernameOrEmail(identifier)
        );
        
        if (!user) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }
        
        // Check password (Note: In production, use bcrypt to compare hashed passwords)
        if (user.clave !== clave) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }
        
        // Store user session
        req.session.user = {
            id: user._id,
            usuario: user.usuario,
            nombre: user.nombre,
            correo: user.correo,
            saldo: user.saldo
        };
        
        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: {
                id: user._id,
                usuario: user.usuario,
                nombre: user.nombre,
                correo: user.correo,
                saldo: user.saldo
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Error al iniciar sesión'
        });
    }
});

// User logout endpoint
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                error: 'Error al cerrar sesión'
            });
        }
        
        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    });
});

// Check authentication status
router.get('/status', (req, res) => {
    if (req.session.user) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

module.exports = router;