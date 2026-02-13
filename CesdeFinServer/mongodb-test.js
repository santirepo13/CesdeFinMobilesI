// MongoDB Connection Test for CesdeFinServer
// This file tests connectivity to MongoDB before migration

const { MongoClient } = require('mongodb');

// MongoDB connection configuration
const MONGODB_CONFIG = {
    // Update these values with  MongoDB connection details
    uri: '',
    databaseName: '',
    options: {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
    }
};

// Test MongoDB connection
async function testMongoConnection() {
    console.log('Testing MongoDB connection...');
    console.log('Configuration:', {
        uri: MONGODB_CONFIG.uri,
        database: MONGODB_CONFIG.databaseName
    });
    
    const client = new MongoClient(MONGODB_CONFIG.uri, MONGODB_CONFIG.options);
    
    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('✅ MongoDB connection successful!');
        
        // Test database access
        const db = client.db(MONGODB_CONFIG.databaseName);
        
        // Test basic operations
        console.log('Testing database operations...');
        
        // List collections
        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        // Test write/read operation
        const testCollection = db.collection('test');
        const testDoc = { 
            test: true, 
            timestamp: new Date(),
            message: 'MongoDB connectivity test'
        };
        
        const insertResult = await testCollection.insertOne(testDoc);
        console.log('✅ Write test successful - Inserted ID:', insertResult.insertedId);
        
        const findResult = await testCollection.findOne({ _id: insertResult.insertedId });
        console.log('✅ Read test successful - Found document:', findResult.message);
        
        // Clean up test document
        await testCollection.deleteOne({ _id: insertResult.insertedId });
        console.log('✅ Cleanup completed');
        
        // Get database stats
        const stats = await db.stats();
        console.log('Database stats:', {
            name: stats.db,
            collections: stats.collections,
            dataSize: `${(stats.dataSize / 1024).toFixed(2)} KB`,
            indexes: stats.indexes
        });
        
        await client.close();
        console.log('✅ Connection closed successfully');
        
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection test failed:', error.message);
        
        if (error.name === 'MongoServerSelectionError') {
            console.error('Server selection error - MongoDB may not be running');
        } else if (error.name === 'MongoNetworkError') {
            console.error('Network error - Check connection string and network');
        } else if (error.name === 'MongoAuthError') {
            console.error('Authentication error - Check credentials');
        }
        
        try {
            await client.close();
        } catch (closeError) {
            console.error('Error closing connection:', closeError.message);
        }
        
        return false;
    }
}

// Test connection with different configurations
async function testConnectionVariants() {
    console.log('\n=== Testing Connection Variants ===');
    
    const variants = [
        {
            name: 'Local MongoDB',
            uri: 'mongodb://localhost:27017'
        },
        {
            name: 'Local MongoDB with explicit host',
            uri: 'mongodb://127.0.0.1:27017'
        }
    ];
    
    for (const variant of variants) {
        console.log(`\nTesting: ${variant.name}`);
        const client = new MongoClient(variant.uri, { 
            serverSelectionTimeoutMS: 3000 
        });
        
        try {
            await client.connect();
            console.log(`✅ ${variant.name} - Connection successful`);
            await client.close();
        } catch (error) {
            console.log(`❌ ${variant.name} - Failed: ${error.message}`);
        }
    }
}

// Main execution
async function main() {
    console.log('=== MongoDB Connectivity Test for CesdeFin ===');
    console.log('Node.js version:', process.version);
    console.log('MongoDB driver version:', require('mongodb').version);
    
    const success = await testMongoConnection();
    
    if (!success) {
        console.log('\nTrying alternative connection methods...');
        await testConnectionVariants();
    }
    
    console.log('\n=== Test Complete ===');
    process.exit(success ? 0 : 1);
}

// Run test if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

// Export for use in other files
module.exports = {
    testMongoConnection,
    testConnectionVariants,
    MONGODB_CONFIG
};