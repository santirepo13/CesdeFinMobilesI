const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB connection configuration
const MONGODB_CONFIG = {
    uri: process.env.MONGODB_URI,
    databaseName: process.env.DB_NAME || 'CheckingAccountHandler',
    options: {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 5
    }
};

// Path to the JSON file (relative to project root)
const JSON_FILE_PATH = path.join(__dirname, '../../../json/usuarios_realistas.json');

// Migration statistics
let migrationStats = {
    totalUsers: 0,
    successfulMigrations: 0,
    failedMigrations: 0,
    duplicateUsers: 0,
    validationErrors: 0,
    errors: []
};

// Validation functions
function validateUser(user) {
    const errors = [];
    
    // Required fields validation
    if (!user.usuario || typeof user.usuario !== 'string' || user.usuario.trim() === '') {
        errors.push('Usuario is required and must be a non-empty string');
    }
    
    if (!user.clave || typeof user.clave !== 'string' || user.clave.trim() === '') {
        errors.push('Clave is required and must be a non-empty string');
    }
    
    if (!user.nombre || typeof user.nombre !== 'string' || user.nombre.trim() === '') {
        errors.push('Nombre is required and must be a non-empty string');
    }
    
    if (!user.correo || typeof user.correo !== 'string' || user.correo.trim() === '') {
        errors.push('Correo is required and must be a non-empty string');
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (user.correo && !emailRegex.test(user.correo)) {
        errors.push('Correo format is invalid');
    }
    
    // Balance validation
    if (typeof user.saldo !== 'number' || isNaN(user.saldo) || user.saldo < 0) {
        errors.push('Saldo must be a non-negative number');
    }
    
    // Movimientos validation
    if (!Array.isArray(user.movimientos)) {
        errors.push('Movimientos must be an array');
    } else {
        user.movimientos.forEach((mov, index) => {
            if (!mov.tipo || typeof mov.tipo !== 'string') {
                errors.push(`Movimiento ${index}: tipo is required and must be a string`);
            }
            if (typeof mov.valor !== 'number' || isNaN(mov.valor)) {
                errors.push(`Movimiento ${index}: valor must be a number`);
            }
            if (!mov.fecha || typeof mov.fecha !== 'string') {
                errors.push(`Movimiento ${index}: fecha is required and must be a string`);
            }
        });
    }
    
    return errors;
}

// Clean and normalize user data
function cleanUserData(user) {
    const cleanedUser = {
        usuario: user.usuario.trim(),
        clave: user.clave.trim(),
        nombre: user.nombre.trim(),
        correo: user.correo.trim().toLowerCase(),
        saldo: parseFloat(user.saldo) || 0,
        movimientos: []
    };
    
    // Clean movements
    if (Array.isArray(user.movimientos)) {
        cleanedUser.movimientos = user.movimientos.map(mov => ({
            tipo: mov.tipo.trim(),
            valor: parseFloat(mov.valor) || 0,
            fecha: mov.fecha.trim(),
            comision: mov.comision || 0,
            neto: mov.neto || mov.valor,
            metodo: mov.metodo || '',
            detalle: mov.detalle || ''
        }));
    }
    
    // Add timestamps
    cleanedUser.createdAt = new Date();
    cleanedUser.updatedAt = new Date();
    
    return cleanedUser;
}

// Load JSON data
function loadJsonData() {
    try {
        const jsonContent = fs.readFileSync(JSON_FILE_PATH, 'utf8');
        const data = JSON.parse(jsonContent);
        
        if (!Array.isArray(data)) {
            throw new Error('JSON file must contain an array of users');
        }
        
        console.log(`Loaded ${data.length} users from JSON file`);
        return data;
    } catch (error) {
        console.error('Error loading JSON file:', error.message);
        throw error;
    }
}

// Migrate users to MongoDB
async function migrateUsers(options = {}) {
    let client;
    try {
        const { clearCollection = false, silent = false } = options;
        
        if (!silent) {
            console.log('\n Starting user migration...');
            console.log(` JSON file: ${JSON_FILE_PATH}`);
            console.log(`  Database: ${MONGODB_CONFIG.databaseName}`);
        }
        
        // Load JSON data
        const usersData = loadJsonData();
        migrationStats.totalUsers = usersData.length;
        
        // Connect to MongoDB
        client = new MongoClient(MONGODB_CONFIG.uri, MONGODB_CONFIG.options);
        await client.connect();
        const db = client.db(MONGODB_CONFIG.databaseName);
        const usersCollection = db.collection('users');
        
        if (!silent) console.log('Connected to MongoDB');
        
        // Check if collection already has data
        const existingCount = await usersCollection.countDocuments();
        if (existingCount > 0 && clearCollection) {
            await usersCollection.deleteMany({});
            if (!silent) console.log('Collection cleared');
        }
        
        // Process users in batches
        const batchSize = 50;
        const batches = [];
        
        for (let i = 0; i < usersData.length; i += batchSize) {
            batches.push(usersData.slice(i, i + batchSize));
        }
        
        if (!silent) {
            console.log(`\n Processing ${batches.length} batches of ${batchSize} users each...`);
        }
        
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];
            if (!silent) {
                console.log(`\n Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} users)`);
            }
            
            const batchToInsert = [];
            
            // Validate and clean each user in the batch
            for (const user of batch) {
                const validationErrors = validateUser(user);
                
                if (validationErrors.length > 0) {
                    migrationStats.validationErrors++;
                    migrationStats.errors.push({
                        usuario: user.usuario || 'UNKNOWN',
                        errors: validationErrors
                    });
                    if (!silent) console.log(`Validation failed for user: ${user.usuario || 'UNKNOWN'}`);
                    continue;
                }
                
                const cleanedUser = cleanUserData(user);
                batchToInsert.push(cleanedUser);
            }
            
            if (batchToInsert.length > 0) {
                try {
                    const result = await usersCollection.insertMany(batchToInsert, { 
                        ordered: false,
                        ignoreUndefined: true
                    });
                    migrationStats.successfulMigrations += result.insertedCount;
                    if (!silent) console.log(`Inserted ${result.insertedCount} users`);
                } catch (error) {
                    if (error.code === 11000) {
                        // Handle duplicate key errors
                        const duplicates = error.writeErrors?.length || 0;
                        migrationStats.duplicateUsers += duplicates;
                        if (!silent) console.log(`${duplicates} duplicate users skipped`);
                        
                        // Try to insert non-duplicate documents
                        const nonDuplicates = batchToInsert.filter(user => 
                            !error.writeErrors?.some(err => err.op.usuario === user.usuario)
                        );
                        
                        if (nonDuplicates.length > 0) {
                            const retryResult = await usersCollection.insertMany(nonDuplicates, { 
                                ordered: false,
                                ignoreUndefined: true
                            });
                            migrationStats.successfulMigrations += retryResult.insertedCount;
                            if (!silent) console.log(`Inserted ${retryResult.insertedCount} non-duplicate users`);
                        }
                    } else {
                        migrationStats.failedMigrations += batchToInsert.length;
                        migrationStats.errors.push({
                            batch: batchIndex + 1,
                            error: error.message
                        });
                        if (!silent) console.log(`Batch ${batchIndex + 1} failed: ${error.message}`);
                    }
                }
            }
        }
        
        // Verify migration
        await verifyMigration(db, silent);
        
        return migrationStats;
        
    } catch (error) {
        console.error('Migration failed:', error);
        migrationStats.errors.push({
            type: 'MIGRATION_ERROR',
            error: error.message
        });
        throw error;
    } finally {
        if (client) {
            await client.close();
            if (!silent) console.log('\n🔌 MongoDB connection closed');
        }
    }
}

// Verify migration results
async function verifyMigration(db) {
    console.log('\n🔍 Verifying migration...');
    
    const usersCollection = db.collection('users');
    const totalMigrated = await usersCollection.countDocuments();
    
    if (!silent) console.log(`Migration Statistics:`);
    console.log(`   Total users in JSON: ${migrationStats.totalUsers}`);
    console.log(`   Successfully migrated: ${migrationStats.successfulMigrations}`);
    console.log(`   Failed migrations: ${migrationStats.failedMigrations}`);
    console.log(`   Duplicate users: ${migrationStats.duplicateUsers}`);
    console.log(`   Validation errors: ${migrationStats.validationErrors}`);
    console.log(`   Total users in DB: ${totalMigrated}`);
    
    // Sample verification
    const sampleUsers = await usersCollection.find({}).limit(3).toArray();
    console.log('\n📝 Sample migrated users:');
    sampleUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.usuario} - ${user.nombre} - Saldo: $${user.saldo.toLocaleString('es-CO')}`);
    });
    
    // Check for any critical issues
    if (migrationStats.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        migrationStats.errors.slice(0, 5).forEach((error, index) => {
            console.log(`   ${index + 1}. ${JSON.stringify(error)}`);
        });
        if (migrationStats.errors.length > 5) {
            console.log(`   ... and ${migrationStats.errors.length - 5} more errors`);
        }
    }
    
    const success = migrationStats.successfulMigrations > 0 && 
                   migrationStats.failedMigrations === 0;
    
    console.log(`\n${success ? '✅' : '❌'} Migration ${success ? 'completed successfully' : 'completed with issues'}`);
    
    return success;
}

// Main execution
async function main() {
    console.log('====================================');
    console.log('CesdeFin User Migration Tool');
    console.log('====================================');
    
    try {
        const stats = await migrateUsers();
        console.log('\n✨ Migration completed!');
        return stats;
    } catch (error) {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { migrateUsers, migrationStats, verifyMigration };