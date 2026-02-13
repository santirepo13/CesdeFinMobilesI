/**
 * Users Routes
 * Handles user management endpoints (CRUD operations)
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const UserService = require('../services/userService');

// Middleware to inject userService
router.use((req, res, next) => {
    req.userService = new UserService(req.db);
    next();
});

// GET /api/users - Get all users
router.get('/', authenticate, async (req, res) => {
    try {
        const users = await req.userService.findAll();

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Error al obtener usuarios'
        });
    }
});

// GET /api/users/:username - Get user by username
router.get('/:username', authenticate, async (req, res) => {
    try {
        const { username } = req.params;
        const user = await req.userService.findByUsername(username);

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Remove password from response
        const { clave, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Error al obtener usuario'
        });
    }
});

// POST /api/users - Create new user
router.post('/', authenticate, async (req, res) => {
    const { usuario, clave, nombre, correo, saldo = 0 } = req.body;

    // Validation
    if (!usuario || !clave || !nombre || !correo) {
        return res.status(400).json({
            error: 'Todos los campos son obligatorios',
            required: ['usuario', 'clave', 'nombre', 'correo']
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        return res.status(400).json({
            error: 'Correo inválido'
        });
    }

    // Password validation
    if (clave.length < 8) {
        return res.status(400).json({
            error: 'La contraseña debe tener al menos 8 caracteres'
        });
    }

    try {
        // Check if user exists
        const existingUser = await req.userService.exists(usuario, correo);
        if (existingUser) {
            const field = existingUser.usuario === usuario ? 'usuario' : 'correo';
            return res.status(400).json({
                error: `${field} Duplicado`,
                field
            });
        }

        const newUser = await req.userService.create({
            usuario,
            clave,
            nombre,
            correo,
            saldo
        });

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            userId: newUser.id
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                error: `${field} Duplicado`,
                field
            });
        }
        console.error('Create user error:', error);
        res.status(500).json({
            error: 'Error al crear usuario'
        });
    }
});

// PUT /api/users/:username - Update user
router.put('/:username', authenticate, async (req, res) => {
    try {
        const { username } = req.params;
        const { correo } = req.body;

        const user = await req.userService.findByUsername(username);
        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Check if email is taken by another user
        if (correo && correo !== user.correo) {
            const existingUser = await req.userService.findByEmail(correo);
            if (existingUser && existingUser.usuario !== username) {
                return res.status(400).json({
                    error: 'El correo ya está registrado por otro usuario'
                });
            }
        }

        const result = await req.userService.updateProfile(user._id.toString(), { correo });

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            error: 'Error al actualizar usuario'
        });
    }
});

// DELETE /api/users/:username - Delete user
router.delete('/:username', authenticate, async (req, res) => {
    try {
        const { username } = req.params;

        const user = await req.userService.findByUsername(username);
        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Check if user has balance
        if (user.saldo > 0) {
            return res.status(400).json({
                error: `No puedes eliminar el usuario mientras tenga un saldo de $${user.saldo.toLocaleString('es-CO')}`
            });
        }

        const result = await req.userService.delete(user._id.toString());

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: 'No se pudo eliminar el usuario'
            });
        }

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            error: 'Error al eliminar usuario'
        });
    }
});

module.exports = router;