/**
 * User Service Layer
 * Handles all user-related database operations
 */

const { ObjectId } = require('mongodb');
const { userHelpers } = require('../models/User');

class UserService {
    constructor(db) {
        this.db = db;
        this.collectionName = 'users';
    }

    getCollection() {
        return this.db.collection(this.collectionName);
    }

    /**
     * Find all users (excluding password field)
     */
    async findAll() {
        return await this.getCollection()
            .find({})
            .project({ clave: 0 })
            .toArray();
    }

    /**
     * Find user by username
     */
    async findByUsername(username) {
        return await this.getCollection().findOne({ usuario: username });
    }

    /**
     * Find user by email
     */
    async findByEmail(email) {
        return await this.getCollection().findOne({ correo: email });
    }

    /**
     * Find user by username or email
     */
    async findByUsernameOrEmail(identifier) {
        const query = userHelpers.findByUsernameOrEmail(identifier);
        return await this.getCollection().findOne(query);
    }

    /**
     * Find user by ID
     */
    async findById(userId) {
        const objectId = new ObjectId(userId);
        return await this.getCollection().findOne(
            { _id: objectId },
            { projection: { clave: 0 } }
        );
    }

    /**
     * Find user by ID with password (for authentication)
     */
    async findByIdWithPassword(userId) {
        const objectId = new ObjectId(userId);
        return await this.getCollection().findOne({ _id: objectId });
    }

    /**
     * Check if user exists by username or email
     */
    async exists(usuario, correo, excludeUserId = null) {
        const query = {
            $or: [
                { usuario: usuario },
                { correo: correo }
            ]
        };

        if (excludeUserId) {
            query._id = { $ne: new ObjectId(excludeUserId) };
        }

        return await this.getCollection().findOne(query);
    }

    /**
     * Create a new user
     */
    async create(userData) {
        const newUser = {
            usuario: userData.usuario,
            clave: userData.clave,
            nombre: userData.nombre,
            correo: userData.correo,
            saldo: parseFloat(userData.saldo || 0),
            movimientos: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await this.getCollection().insertOne(newUser);
        return {
            id: result.insertedId,
            ...newUser
        };
    }

    /**
     * Update user profile (email only)
     */
    async updateProfile(userId, updateData) {
        const objectId = new ObjectId(userId);
        const updateDoc = {
            $set: {
                ...updateData,
                updatedAt: new Date()
            }
        };

        return await this.getCollection().updateOne(
            { _id: objectId },
            updateDoc
        );
    }

    /**
     * Update username
     */
    async updateUsername(userId, newUsername) {
        const objectId = new ObjectId(userId);
        return await this.getCollection().updateOne(
            { _id: objectId },
            {
                $set: {
                    usuario: newUsername.trim(),
                    updatedAt: new Date()
                }
            }
        );
    }

    /**
     * Update password
     */
    async updatePassword(userId, newPassword) {
        const objectId = new ObjectId(userId);
        return await this.getCollection().updateOne(
            { _id: objectId },
            {
                $set: {
                    clave: newPassword,
                    updatedAt: new Date()
                }
            }
        );
    }

    /**
     * Update user balance
     */
    async updateBalance(username, amount) {
        return await this.getCollection().updateOne(
            { usuario: username },
            {
                $inc: { saldo: amount },
                $set: { updatedAt: new Date() }
            }
        );
    }

    /**
     * Add movement to user
     */
    async addMovement(username, movement) {
        return await this.getCollection().updateOne(
            { usuario: username },
            {
                $push: { movimientos: movement },
                $set: { updatedAt: new Date() }
            }
        );
    }

    /**
     * Delete user account
     */
    async delete(userId) {
        const objectId = new ObjectId(userId);
        return await this.getCollection().deleteOne({ _id: objectId });
    }

    /**
     * Get user balance
     */
    async getBalance(username) {
        const user = await this.getCollection().findOne(
            { usuario: username },
            { projection: { saldo: 1, usuario: 1, nombre: 1, updatedAt: 1 } }
        );
        return user;
    }

    /**
     * Get user transactions
     */
    async getTransactions(username) {
        const user = await this.getCollection().findOne(
            { usuario: username },
            { projection: { movimientos: 1 } }
        );
        return user ? user.movimientos || [] : [];
    }
}

module.exports = UserService;