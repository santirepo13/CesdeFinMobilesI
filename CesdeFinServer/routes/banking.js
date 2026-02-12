const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Commission rates
const COMMISSION_RATES = {
    banco: 0.01,      
    tarjeta: 0.025,   
    efectivo: 0.005,  
    transferencia: 0.0025  
};

// Helper function to generate withdrawal code
function generateWithdrawalCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to validate amount
function validateAmount(amount) {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
}

// Helper function to create transaction record
function createTransaction(type, amount, commission = 0, netAmount = amount, method = '', detail = '') {
    return {
        tipo: type,
        valor: amount,
        comision: commission,
        neto: netAmount,
        metodo: method,
        detalle: detail,
        fecha: new Date().toISOString()
    };
}

// POST /api/banking/deposit - Deposit money with commission
router.post('/deposit', authenticate, async (req, res) => {
    const db = req.db;
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
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ usuario: currentUser.usuario });

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        const commissionRate = COMMISSION_RATES[method.toLowerCase()];
        const commission = Math.round(amount * commissionRate);
        const netAmount = amount - commission;

        // Create transaction record
        const transaction = createTransaction(
            'consignación',
            amount,
            commission,
            netAmount,
            method.charAt(0).toUpperCase() + method.slice(1),
            detail
        );

        // Update user balance and add transaction
        const result = await usersCollection.updateOne(
            { usuario: currentUser.usuario },
            {
                $inc: { saldo: netAmount },
                $push: { movimientos: transaction },
                $set: { updatedAt: new Date() }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Get updated user data
        const updatedUser = await usersCollection.findOne(
            { usuario: currentUser.usuario },
            { projection: { clave: 0 } }
        );

        res.json({
            success: true,
            message: 'Depósito realizado exitosamente',
            data: {
                amount,
                commission,
                netAmount,
                method,
                newBalance: updatedUser.saldo,
                transaction
            }
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
    const db = req.db;
    const { amount } = req.body;
    const currentUser = req.session.user;

    if (!validateAmount(amount)) {
        return res.status(400).json({
            error: 'Monto inválido',
            message: 'El monto debe ser un número positivo'
        });
    }

    try {
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ usuario: currentUser.usuario });

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        if (user.saldo < amount) {
            return res.status(400).json({
                error: 'Fondos insuficientes',
                message: 'Saldo disponible: $' + user.saldo.toLocaleString('es-CO')
            });
        }

        // Generate withdrawal code
        const withdrawalCode = generateWithdrawalCode();

        // Create transaction record
        const transaction = createTransaction(
            'retiro',
            -amount,
            0,
            -amount,
            '',
            `Código de retiro: ${withdrawalCode}`
        );

        // Update user balance and add transaction
        const result = await usersCollection.updateOne(
            { usuario: currentUser.usuario },
            {
                $inc: { saldo: -amount },
                $push: { movimientos: transaction },
                $set: { updatedAt: new Date() }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Get updated user data
        const updatedUser = await usersCollection.findOne(
            { usuario: currentUser.usuario },
            { projection: { clave: 0 } }
        );

        res.json({
            success: true,
            message: 'Retiro realizado exitosamente',
            data: {
                amount,
                withdrawalCode,
                newBalance: updatedUser.saldo,
                transaction
            }
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
    const db = req.db;
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
        const usersCollection = db.collection('users');
        
        // Get both users
        const originUser = await usersCollection.findOne({ usuario: currentUser.usuario });
        const targetUserObj = await usersCollection.findOne({ usuario: targetUser });

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

        if (originUser.saldo < amount) {
            return res.status(400).json({
                error: 'Fondos insuficientes',
                message: 'Saldo disponible: $' + originUser.saldo.toLocaleString('es-CO')
            });
        }

        // Calculate commission and net amount
        const commission = Math.round(amount * COMMISSION_RATES.transferencia);
        const netAmount = amount - commission;

        // Create transaction records
        const originTransaction = createTransaction(
            'transferencia',
            -amount,
            commission,
            -amount,
            '',
            `Transferencia a ${targetUser}`
        );

        const targetTransaction = createTransaction(
            'transferencia',
            netAmount,
            0,
            netAmount,
            '',
            `Transferencia de ${currentUser.usuario}`
        );

        // Update both users
        const session = db.client.startSession();
        
        try {
            await session.withTransaction(async () => {
                // Update origin user
                await usersCollection.updateOne(
                    { usuario: currentUser.usuario },
                    {
                        $inc: { saldo: -amount },
                        $push: { movimientos: originTransaction },
                        $set: { updatedAt: new Date() }
                    },
                    { session }
                );

                // Update target user
                await usersCollection.updateOne(
                    { usuario: targetUser },
                    {
                        $inc: { saldo: netAmount },
                        $push: { movimientos: targetTransaction },
                        $set: { updatedAt: new Date() }
                    },
                    { session }
                );
            });
        } finally {
            await session.endSession();
        }

        // Get updated user data
        const updatedOriginUser = await usersCollection.findOne(
            { usuario: currentUser.usuario },
            { projection: { clave: 0 } }
        );

        res.json({
            success: true,
            message: 'Transferencia realizada exitosamente',
            data: {
                amount,
                commission,
                netAmount,
                targetUser,
                newBalance: updatedOriginUser.saldo,
                originTransaction,
                targetTransaction
            }
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
    const db = req.db;
    const currentUser = req.session.user;

    try {
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne(
            { usuario: currentUser.usuario },
            { projection: { clave: 0 } }
        );

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: {
                usuario: user.usuario,
                nombre: user.nombre,
                saldo: user.saldo,
                lastUpdated: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Balance inquiry error:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo consultar el saldo'
        });
    }
});

// GET /api/banking/transactions - Get user transaction history
router.get('/transactions', authenticate, async (req, res) => {
    const db = req.db;
    const currentUser = req.session.user;
    const { limit = 50, offset = 0, type } = req.query;

    try {
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne(
            { usuario: currentUser.usuario },
            { projection: { clave: 0 } }
        );

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        let transactions = user.movimientos || [];

        // Filter by type if specified
        if (type) {
            transactions = transactions.filter(t => t.tipo === type);
        }

        // Sort by date (newest first)
        transactions.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // Apply pagination
        const totalCount = transactions.length;
        const paginatedTransactions = transactions.slice(
            parseInt(offset),
            parseInt(offset) + parseInt(limit)
        );

        res.json({
            success: true,
            data: {
                transactions: paginatedTransactions,
                pagination: {
                    total: totalCount,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: parseInt(offset) + parseInt(limit) < totalCount
                }
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
    res.json({
        success: true,
        data: {
            commissionRates: COMMISSION_RATES,
            formatted: {
                banco: '1%',
                tarjeta: '2.5%',
                efectivo: '0.5%',
                transferencia: '0.25%'
            }
        }
    });
});

module.exports = router;