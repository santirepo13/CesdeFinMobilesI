/**
 * User Schema Definition for CesdeFin Banking System
 * Defines the structure for user accounts in MongoDB

 */
const userSchema = {
    usuario: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    clave: {
        type: String,
        required: true,
        minlength: 8
    },
    nombre: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    saldo: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    movimientos: [{
        tipo: {
            type: String,
            required: true,
            enum: ['consignación', 'transferencia', 'retiro']
        },
        valor: {
            type: Number,
            required: true
        },
        fecha: {
            type: String,
            required: true
        },
        usuarioRelacionado: {
            type: String,
            required: false
        }
        
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
};

// Indexes for performance
const userIndexes = [
    { key: { usuario: 1 }, unique: true },
    { key: { correo: 1 }, unique: true },
    { key: { createdAt: -1 } }
];

// Helper functions for user operations
const userHelpers = {
    // Method to add movement to user document
    addMovement: (userDoc, tipo, valor, fecha, usuarioRelacionado) => {
        const movement = {
            tipo,
            valor,
            fecha: fecha || new Date().toISOString().split('T')[0],
            usuarioRelacionado: usuarioRelacionado || null
        };
        
        if (!userDoc.movimientos) {
            userDoc.movimientos = [];
        }
        userDoc.movimientos.push(movement);
        userDoc.updatedAt = new Date();
        return userDoc;
    },
    
    // Method to update balance
    updateBalance: (userDoc, newBalance) => {
        userDoc.saldo = newBalance;
        userDoc.updatedAt = new Date();
        return userDoc;
    },
    
    // Create query to find by username or email
    findByUsernameOrEmail: (identifier) => {
        return {
            $or: [
                { usuario: identifier },
                { correo: identifier }
            ]
        };
    }
};

module.exports = {
    userSchema,
    userIndexes,
    userHelpers
};