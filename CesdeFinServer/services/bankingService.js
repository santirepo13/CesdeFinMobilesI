/**
 * Banking Service Layer
 * Handles all banking-related database operations
 */

const UserService = require('./userService');

// Commission rates
const COMMISSION_RATES = {
    banco: 0.01,
    tarjeta: 0.025,
    efectivo: 0.005,
    transferencia: 0.005
};

class BankingService {
    constructor(db) {
        this.db = db;
        this.userService = new UserService(db);
    }

    /**
     * Get commission rates
     */
    getCommissionRates() {
        return {
            rates: COMMISSION_RATES,
            formatted: {
                banco: '1%',
                tarjeta: '2.5%',
                efectivo: '0.5%',
                transferencia: '0.5%'
            }
        };
    }

    /**
     * Calculate commission for a given amount and method
     */
    calculateCommission(amount, method) {
        const rate = COMMISSION_RATES[method.toLowerCase()] || 0;
        return Math.round(amount * rate);
    }

    /**
     * Generate withdrawal code
     */
    generateWithdrawalCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Create transaction record
     */
    createTransaction(type, amount, commission = 0, netAmount = amount, method = '', detail = '') {
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

    /**
     * Process deposit
     */
    async deposit(username, amount, method, detail = '') {
        const commission = this.calculateCommission(amount, method);
        const netAmount = amount - commission;

        const transaction = this.createTransaction(
            'consignación',
            amount,
            commission,
            netAmount,
            method.charAt(0).toUpperCase() + method.slice(1),
            detail
        );

        const result = await this.userService.addMovement(username, transaction);
        await this.userService.updateBalance(username, netAmount);

        const updatedUser = await this.userService.findByUsername(username);

        return {
            success: true,
            amount,
            commission,
            netAmount,
            method,
            newBalance: updatedUser.saldo,
            transaction
        };
    }

    /**
     * Process withdrawal
     */
    async withdraw(username, amount) {
        const withdrawalCode = this.generateWithdrawalCode();

        const transaction = this.createTransaction(
            'retiro',
            -amount,
            0,
            -amount,
            '',
            `Código de retiro: ${withdrawalCode}`
        );

        await this.userService.addMovement(username, transaction);
        await this.userService.updateBalance(username, -amount);

        const updatedUser = await this.userService.findByUsername(username);

        return {
            success: true,
            amount,
            withdrawalCode,
            newBalance: updatedUser.saldo,
            transaction
        };
    }

    /**
     * Process transfer between users
     */
    async transfer(originUsername, targetUsername, amount) {
        const commission = this.calculateCommission(amount, 'transferencia');
        const totalDebit = amount + commission;

        const originTransaction = this.createTransaction(
            'transferencia',
            -amount,
            commission,
            -totalDebit,
            '',
            `Transferencia a ${targetUsername}`
        );

        const targetTransaction = this.createTransaction(
            'transferencia',
            amount,
            0,
            amount,
            '',
            `Transferencia de ${originUsername}`
        );

        // Use MongoDB transaction for atomicity
        const session = this.db.client.startSession();

        try {
            await session.withTransaction(async () => {
                // Update origin user
                await this.db.collection('users').updateOne(
                    { usuario: originUsername },
                    {
                        $inc: { saldo: -totalDebit },
                        $push: { movimientos: originTransaction },
                        $set: { updatedAt: new Date() }
                    },
                    { session }
                );

                // Update target user
                await this.db.collection('users').updateOne(
                    { usuario: targetUsername },
                    {
                        $inc: { saldo: amount },
                        $push: { movimientos: targetTransaction },
                        $set: { updatedAt: new Date() }
                    },
                    { session }
                );
            });
        } finally {
            await session.endSession();
        }

        const updatedOriginUser = await this.userService.findByUsername(originUsername);

        return {
            success: true,
            amount,
            commission,
            totalDebit,
            targetUser: targetUsername,
            newBalance: updatedOriginUser.saldo,
            originTransaction,
            targetTransaction
        };
    }

    /**
     * Get user balance with details
     */
    async getBalance(username) {
        const user = await this.userService.findByUsername(username);
        if (!user) {
            return null;
        }

        return {
            usuario: user.usuario,
            nombre: user.nombre,
            saldo: user.saldo,
            lastUpdated: user.updatedAt
        };
    }

    /**
     * Validate if user has sufficient funds
     */
    async hasSufficientFunds(username, amount) {
        const user = await this.userService.findByUsername(username);
        if (!user) {
            return false;
        }
        return user.saldo >= amount;
    }
}

module.exports = BankingService;