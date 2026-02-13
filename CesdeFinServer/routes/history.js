/**
 * History Routes
 * Handles transaction history endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const HistoryService = require('../services/historyService');
const UserService = require('../services/userService');

// Middleware to inject services
router.use((req, res, next) => {
    req.historyService = new HistoryService(req.db);
    req.userService = new UserService(req.db);
    next();
});

// GET /api/history - Get current user's transaction history
router.get('/', authenticate, async (req, res) => {
    try {
        const currentUser = req.session.user;
        const { limit, offset, type, startDate, endDate, sort } = req.query;

        const options = {
            limit: limit || 50,
            offset: offset || 0,
            type,
            startDate,
            endDate,
            sortOrder: sort || 'desc'
        };

        const result = await req.historyService.getTransactions(currentUser.usuario, options);

        if (!result) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            error: 'Error al obtener historial de transacciones'
        });
    }
});

// GET /api/history/recent - Get recent transactions
router.get('/recent', authenticate, async (req, res) => {
    try {
        const currentUser = req.session.user;
        const { limit = 10 } = req.query;

        const result = await req.historyService.getRecentTransactions(
            currentUser.usuario,
            parseInt(limit)
        );

        if (!result) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get recent transactions error:', error);
        res.status(500).json({
            error: 'Error al obtener transacciones recientes'
        });
    }
});

// GET /api/history/statistics - Get transaction statistics
router.get('/statistics', authenticate, async (req, res) => {
    try {
        const currentUser = req.session.user;

        const statistics = await req.historyService.getStatistics(currentUser.usuario);

        if (!statistics) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: statistics
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas'
        });
    }
});

// GET /api/history/search - Search transactions
router.get('/search', authenticate, async (req, res) => {
    try {
        const currentUser = req.session.user;
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                error: 'Término de búsqueda requerido',
                message: 'Proporcione el parámetro "q" para buscar'
            });
        }

        const result = await req.historyService.searchTransactions(currentUser.usuario, q);

        if (!result) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Search transactions error:', error);
        res.status(500).json({
            error: 'Error al buscar transacciones'
        });
    }
});

// GET /api/history/export - Export transactions to CSV
router.get('/export', authenticate, async (req, res) => {
    try {
        const currentUser = req.session.user;

        const csv = await req.historyService.exportToCSV(currentUser.usuario);

        if (!csv) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="transacciones_${currentUser.usuario}.csv"`);
        res.send(csv);
    } catch (error) {
        console.error('Export transactions error:', error);
        res.status(500).json({
            error: 'Error al exportar transacciones'
        });
    }
});

// GET /api/history/by-type/:type - Get transactions by type
router.get('/by-type/:type', authenticate, async (req, res) => {
    try {
        const currentUser = req.session.user;
        const { type } = req.params;
        const { limit, offset } = req.query;

        const options = {
            type,
            limit: limit || 50,
            offset: offset || 0
        };

        const result = await req.historyService.getTransactions(currentUser.usuario, options);

        if (!result) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get transactions by type error:', error);
        res.status(500).json({
            error: 'Error al obtener transacciones por tipo'
        });
    }
});

// GET /api/history/by-date - Get transactions by date range
router.get('/by-date', authenticate, async (req, res) => {
    try {
        const currentUser = req.session.user;
        const { startDate, endDate, limit, offset } = req.query;

        if (!startDate && !endDate) {
            return res.status(400).json({
                error: 'Rango de fechas requerido',
                message: 'Proporcione startDate y/o endDate'
            });
        }

        const options = {
            startDate,
            endDate,
            limit: limit || 50,
            offset: offset || 0
        };

        const result = await req.historyService.getTransactions(currentUser.usuario, options);

        if (!result) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get transactions by date error:', error);
        res.status(500).json({
            error: 'Error al obtener transacciones por fecha'
        });
    }
});

module.exports = router;