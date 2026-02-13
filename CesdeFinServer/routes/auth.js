/**
 * Authentication Routes
 * Handles user authentication, registration, and account management
 */

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const UserService = require('../services/userService');

// Middleware to inject userService
router.use((req, res, next) => {
    req.userService = new UserService(req.db);
    next();
});

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
        const existingUser = await req.userService.exists(usuario, correo);

        if (existingUser) {
            return res.status(400).json({
                error: existingUser.usuario === usuario ? 'El usuario ya existe' : 'El correo ya está registrado'
            });
        }

        // Create new user
        const newUser = await req.userService.create({
            usuario,
            clave,
            nombre,
            correo
        });

        // Store user session
        req.session.user = {
            id: newUser.id,
            usuario: newUser.usuario,
            nombre: newUser.nombre,
            correo: newUser.correo,
            saldo: newUser.saldo
        };

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: {
                id: newUser.id,
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
        const user = await req.userService.findByUsernameOrEmail(identifier);

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

// Update user profile endpoint
router.put('/profile', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: 'No autorizado'
        });
    }

    const { correo } = req.body;

    try {
        const userId = req.session.user.id.toString();

        // Check if email is already taken by another user
        if (correo && correo !== req.session.user.correo) {
            const existingUser = await req.userService.findByEmail(correo);
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({
                    error: 'El correo ya está registrado por otro usuario'
                });
            }
        }

        const result = await req.userService.updateProfile(userId, { correo });

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Update session with new data (only email can be updated)
        if (correo) req.session.user.correo = correo;

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            user: req.session.user
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            error: 'Error al actualizar perfil'
        });
    }
});

// Update username endpoint
router.put('/username', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: 'No autorizado'
        });
    }

    const { nuevoUsuario } = req.body;

    if (!nuevoUsuario || nuevoUsuario.trim().length < 3) {
        return res.status(400).json({
            error: 'El nombre de usuario debe tener al menos 3 caracteres'
        });
    }

    try {
        const userId = req.session.user.id.toString();

        // Check if username is already taken
        const existingUser = await req.userService.findByUsername(nuevoUsuario.trim());
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({
                error: 'El nombre de usuario ya está en uso'
            });
        }

        const result = await req.userService.updateUsername(userId, nuevoUsuario);

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Update session with new username
        req.session.user.usuario = nuevoUsuario.trim();

        res.json({
            success: true,
            message: 'Nombre de usuario actualizado exitosamente',
            user: req.session.user
        });
    } catch (error) {
        console.error('Username update error:', error);
        res.status(500).json({
            error: 'Error al actualizar nombre de usuario'
        });
    }
});

// Change password endpoint
router.put('/password', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: 'No autorizado'
        });
    }

    const { claveActual, nuevaClave } = req.body;

    if (!claveActual || !nuevaClave) {
        return res.status(400).json({
            error: 'La clave actual y la nueva clave son obligatorias'
        });
    }

    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(nuevaClave)) {
        return res.status(400).json({
            error: 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos'
        });
    }

    try {
        const userId = req.session.user.id.toString();

        // Get current user to verify current password
        const user = await req.userService.findByIdWithPassword(userId);

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Verify current password
        if (user.clave !== claveActual) {
            return res.status(400).json({
                error: 'La clave actual no coincide'
            });
        }

        // Update password
        const result = await req.userService.updatePassword(userId, nuevaClave);

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            error: 'Error al cambiar contraseña'
        });
    }
});

// Delete user account endpoint
router.delete('/account', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: 'No autorizado'
        });
    }

    try {
        const userId = req.session.user.id.toString();

        // Get user to check balance
        const user = await req.userService.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Check if user has balance
        if (user.saldo > 0) {
            return res.status(400).json({
                error: `No puedes eliminar tu cuenta mientras tengas un saldo de $${user.saldo.toLocaleString('es-CO')}. Por favor, transfiere tu saldo a otro usuario antes de eliminar tu cuenta.`
            });
        }

        // Delete user from database
        const result = await req.userService.delete(userId);

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: 'No se pudo eliminar la cuenta'
            });
        }

        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({
                    error: 'Error al cerrar sesión'
                });
            }

            res.json({
                success: true,
                message: 'Cuenta eliminada exitosamente'
            });
        });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({
            error: 'Error al eliminar cuenta'
        });
    }
});

module.exports = router;