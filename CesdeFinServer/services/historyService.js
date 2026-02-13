/**
 * History Service Layer
 * Handles all transaction history-related operations
 */

const UserService = require('./userService');

class HistoryService {
    constructor(db) {
        this.db = db;
        this.userService = new UserService(db);
    }

    /**
     * Get all transactions for a user with optional filtering
     */
    async getTransactions(username, options = {}) {
        const { type, startDate, endDate, limit = 50, offset = 0, sortOrder = 'desc' } = options;

        const user = await this.userService.findByUsername(username);
        if (!user) {
            return null;
        }

        let transactions = user.movimientos || [];

        // Filter by type
        if (type) {
            transactions = transactions.filter(t => t.tipo === type);
        }

        // Filter by date range
        if (startDate || endDate) {
            transactions = transactions.filter(t => {
                const transactionDate = new Date(t.fecha);
                if (startDate && transactionDate < new Date(startDate)) {
                    return false;
                }
                if (endDate && transactionDate > new Date(endDate)) {
                    return false;
                }
                return true;
            });
        }

        // Sort by date
        transactions.sort((a, b) => {
            const dateA = new Date(a.fecha);
            const dateB = new Date(b.fecha);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        // Calculate pagination
        const totalCount = transactions.length;
        const paginatedTransactions = transactions.slice(
            parseInt(offset),
            parseInt(offset) + parseInt(limit)
        );

        return {
            transactions: paginatedTransactions,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + parseInt(limit) < totalCount
            },
            summary: this.calculateSummary(transactions)
        };
    }

    /**
     * Get transaction by index
     */
    async getTransactionByIndex(username, index) {
        const user = await this.userService.findByUsername(username);
        if (!user || !user.movimientos) {
            return null;
        }

        const transactions = user.movimientos;
        transactions.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        return transactions[index] || null;
    }

    /**
     * Get transactions by type
     */
    async getTransactionsByType(username, type) {
        return await this.getTransactions(username, { type });
    }

    /**
     * Get transactions by date range
     */
    async getTransactionsByDateRange(username, startDate, endDate) {
        return await this.getTransactions(username, { startDate, endDate });
    }

    /**
     * Search transactions by detail text
     */
    async searchTransactions(username, searchText) {
        const user = await this.userService.findByUsername(username);
        if (!user || !user.movimientos) {
            return null;
        }

        const searchLower = searchText.toLowerCase();
        const transactions = user.movimientos.filter(t => {
            const detailMatch = t.detalle && t.detalle.toLowerCase().includes(searchLower);
            const typeMatch = t.tipo && t.tipo.toLowerCase().includes(searchLower);
            const methodMatch = t.metodo && t.metodo.toLowerCase().includes(searchLower);
            return detailMatch || typeMatch || methodMatch;
        });

        transactions.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        return {
            transactions,
            count: transactions.length,
            summary: this.calculateSummary(transactions)
        };
    }

    /**
     * Get recent transactions
     */
    async getRecentTransactions(username, limit = 10) {
        return await this.getTransactions(username, { limit, offset: 0 });
    }

    /**
     * Get transaction statistics
     */
    async getStatistics(username) {
        const user = await this.userService.findByUsername(username);
        if (!user || !user.movimientos) {
            return null;
        }

        const transactions = user.movimientos;

        return {
            totalTransactions: transactions.length,
            summary: this.calculateSummary(transactions),
            byType: this.groupByType(transactions),
            byMonth: this.groupByMonth(transactions),
            averageTransaction: this.calculateAverage(transactions)
        };
    }

    /**
     * Calculate summary of transactions
     */
    calculateSummary(transactions) {
        const deposits = transactions.filter(t => t.tipo === 'consignación');
        const withdrawals = transactions.filter(t => t.tipo === 'retiro');
        const transfers = transactions.filter(t => t.tipo === 'transferencia');

        const totalDeposits = deposits.reduce((sum, t) => sum + Math.abs(t.valor || 0), 0);
        const totalWithdrawals = withdrawals.reduce((sum, t) => sum + Math.abs(t.valor || 0), 0);
        const totalTransferOut = transfers
            .filter(t => t.valor < 0)
            .reduce((sum, t) => sum + Math.abs(t.valor || 0), 0);
        const totalTransferIn = transfers
            .filter(t => t.valor > 0)
            .reduce((sum, t) => sum + (t.valor || 0), 0);
        const totalCommissions = transactions.reduce((sum, t) => sum + (t.comision || 0), 0);

        return {
            totalDeposits,
            totalWithdrawals,
            totalTransferOut,
            totalTransferIn,
            totalCommissions,
            netFlow: totalDeposits + totalTransferIn - totalWithdrawals - totalTransferOut
        };
    }

    /**
     * Group transactions by type
     */
    groupByType(transactions) {
        const grouped = {};
        transactions.forEach(t => {
            const type = t.tipo || 'unknown';
            if (!grouped[type]) {
                grouped[type] = { count: 0, total: 0 };
            }
            grouped[type].count++;
            grouped[type].total += Math.abs(t.valor || 0);
        });
        return grouped;
    }

    /**
     * Group transactions by month
     */
    groupByMonth(transactions) {
        const grouped = {};
        transactions.forEach(t => {
            const date = new Date(t.fecha);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!grouped[monthKey]) {
                grouped[monthKey] = { count: 0, total: 0 };
            }
            grouped[monthKey].count++;
            grouped[monthKey].total += Math.abs(t.valor || 0);
        });
        return grouped;
    }

    /**
     * Calculate average transaction amount
     */
    calculateAverage(transactions) {
        if (transactions.length === 0) {
            return 0;
        }
        const total = transactions.reduce((sum, t) => sum + Math.abs(t.valor || 0), 0);
        return total / transactions.length;
    }

    /**
     * Export transactions to CSV format
     */
    async exportToCSV(username) {
        const user = await this.userService.findByUsername(username);
        if (!user || !user.movimientos) {
            return null;
        }

        const transactions = [...user.movimientos];
        transactions.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const headers = ['Fecha', 'Tipo', 'Valor', 'Comision', 'Neto', 'Metodo', 'Detalle'];
        const rows = transactions.map(t => [
            t.fecha,
            t.tipo,
            t.valor,
            t.comision || 0,
            t.neto || t.valor,
            t.metodo || '',
            `"${(t.detalle || '').replace(/"/g, '""')}"`
        ]);

        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }
}

module.exports = HistoryService;