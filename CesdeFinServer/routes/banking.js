/**
 * Banking Routes
 * Handles core banking operations (deposit, withdraw, transfer, balance)
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const BankingService = require('../services/bankingService');
const UserService = require('../services/userService');
const router = express.Router();

// Middleware to inject services
router.use((req, res, next) => {
    req.bankingService = new BankingService(req.db);
    req.userService = new UserService(req.db);
    next();
});

// Helper function to validate amount
function validateAmount(amount) {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
}

// POST /api/banking/deposit - Deposit money with commission
router.post('/deposit', authenticate, async (req, res) => {
    const { amount, method, detail = '' } = req.body;
    const currentUser = req.session.user;

    if (!validateAmount(amount)) {
        return res.status(400).json({
            error: 'Monto inválido',
            message: 'El monto debe ser un número positivo'
        });
    }

    if (!method || !['banco', 'tarjeta', 'efectivo'].includes(method.toLowerCase())) {
        return res.status(400).json({
            error: 'Método de depósito inválido',
            message: 'Métodos válidos: banco, tarjeta, efectivo'
        });
    }

    try {
        // Verify user exists
        const user = await req.userService.findByUsername(currentUser.usuario);
        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        const result = await req.bankingService.deposit(
            currentUser.usuario,
            parseFloat(amount),
            method,
            detail
        );

        // Update session with new balance
        req.session.user.saldo = result.newBalance;
        req.session.save((err) => {
            if (err) {
                console.error('Session save error (deposit):', err);
            }

            res.json({
                success: true,
                message: 'Depósito realizado exitosamente',
                data: result
            });
        });

    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo procesar el depósito'
        });
    }
});

// POST /api/banking/withdraw - Withdraw money with code generation
router.post('/withdraw', authenticate, async (req, res) => {
    const { amount } = req.body;
    const currentUser = req.session.user;

    if (!validateAmount(amount)) {
        return res.status(400).json({
            error: 'Monto inválido',
            message: 'El monto debe ser un número positivo'
        });
    }

    try {
        const user = await req.userService.findByUsername(currentUser.usuario);

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        if (user.saldo < parseFloat(amount)) {
            return res.status(400).json({
                error: 'Fondos insuficientes',
                message: 'Saldo disponible: $' + user.saldo.toLocaleString('es-CO')
            });
        }

        const result = await req.bankingService.withdraw(
            currentUser.usuario,
            parseFloat(amount)
        );

        // Update session with new balance
        req.session.user.saldo = result.newBalance;
        req.session.save((err) => {
            if (err) {
                console.error('Session save error (withdraw):', err);
            }

            res.json({
                success: true,
                message: 'Retiro realizado exitosamente',
                data: result
            });
        });

    } catch (error) {
        console.error('Withdraw error:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo procesar el retiro'
        });
    }
});

// POST /api/banking/transfer - Transfer money to another user
router.post('/transfer', authenticate, async (req, res) => {
    const { targetUser, amount } = req.body;
    const currentUser = req.session.user;

    if (!validateAmount(amount)) {
        return res.status(400).json({
            error: 'Monto inválido',
            message: 'El monto debe ser un número positivo'
        });
    }

    if (!targetUser || targetUser.trim() === '') {
        return res.status(400).json({
            error: 'Usuario de destino requerido',
            message: 'Debe especificar el usuario de destino'
        });
    }

    if (targetUser === currentUser.usuario) {
        return res.status(400).json({
            error: 'Transferencia inválida',
            message: 'No puede transferirse a sí mismo'
        });
    }

    try {
        // Get both users
        const originUser = await req.userService.findByUsername(currentUser.usuario);
        const targetUserObj = await req.userService.findByUsername(targetUser);

        if (!originUser) {
            return res.status(404).json({
                error: 'Usuario origen no encontrado'
            });
        }

        if (!targetUserObj) {
            return res.status(404).json({
                error: 'Usuario destino no encontrado',
                message: `El usuario '${targetUser}' no existe`
            });
        }

        // Calculate commission and total debit
        const commission = req.bankingService.calculateCommission(parseFloat(amount), 'transferencia');
        const totalDebit = parseFloat(amount) + commission;

        if (originUser.saldo < totalDebit) {
            return res.status(400).json({
                error: 'Fondos insuficientes',
                message: 'Saldo disponible: $' + originUser.saldo.toLocaleString('es-CO') + ', Total requerido: $' + totalDebit.toLocaleString('es-CO')
            });
        }

        const result = await req.bankingService.transfer(
            currentUser.usuario,
            targetUser,
            parseFloat(amount)
        );

        // Update session with new balance
        req.session.user.saldo = result.newBalance;
        req.session.save((err) => {
            if (err) {
                console.error('Session save error (transfer):', err);
            }

            res.json({
                success: true,
                message: 'Transferencia realizada exitosamente',
                data: result
            });
        });

    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo procesar la transferencia'
        });
    }
});

// GET /api/banking/balance - Get user balance
router.get('/balance', authenticate, async (req, res) => {
    const currentUser = req.session.user;

    try {
        const balance = await req.bankingService.getBalance(currentUser.usuario);

        if (!balance) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: balance
        });

    } catch (error) {
        console.error('Balance inquiry error:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo consultar el saldo'
        });
    }
});

// GET /api/banking/transactions - Get user transaction history (redirects to /api/history)
router.get('/transactions', authenticate, async (req, res) => {
    const currentUser = req.session.user;
    const { limit = 50, offset = 0, type } = req.query;

    try {
        const HistoryService = require('../services/historyService');
        const historyService = new HistoryService(req.db);

        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            type
        };

        const result = await historyService.getTransactions(currentUser.usuario, options);

        if (!result) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: {
                transactions: result.transactions,
                pagination: result.pagination
            }
        });

    } catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo obtener el historial de transacciones'
        });
    }
});

// GET /api/banking/commission-rates - Get commission rates
router.get('/commission-rates', authenticate, (req, res) => {
    const bankingService = new BankingService(req.db);
    const rates = bankingService.getCommissionRates();

    res.json({
        success: true,
        data: rates
    });
});

module.exports = router;
