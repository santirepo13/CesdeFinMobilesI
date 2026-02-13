const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session');
require('dotenv').config();
const { userSchema, userIndexes, userHelpers } = require('./models/User');
const authRoutes = require('./routes/auth');
const bankingRoutes = require('./routes/banking');
const usersRoutes = require('./routes/users');
const historyRoutes = require('./routes/history');
const { authenticate } = require('./middleware/auth');

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

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'cesdefin-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// CORS middleware
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// MongoDB connection
let db;
let client;

async function connectToDatabase() {
    try {
        client = new MongoClient(MONGODB_CONFIG.uri, MONGODB_CONFIG.options);
        await client.connect();
        db = client.db(MONGODB_CONFIG.databaseName);
        console.log(`Connected to DB Handler: ${MONGODB_CONFIG.databaseName}`);
        
        // Create indexes for better performance
        await createIndexes();
        
        return true;
    } catch (error) {
        console.error('No Connection to DB Handler:', error.message);
        return false;
    }
}

// Create database indexes
async function createIndexes() {
    try {
        const usersCollection = db.collection('users');
        
        // Create indexes from userIndexes array
        for (const index of userIndexes) {
            const options = index.unique !== undefined ? { unique: index.unique } : {};
            await usersCollection.createIndex(index.key, options);
        }
        
        console.log('Database indexes ok');
    } catch (error) {
        console.error('no indexes:', error.message);
    }
}

// Error handling middleware
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'CesdeFin Banking API Server',
        version: '0.0.1',
        database: db ? 'connected' : 'disconnected',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            users: '/api/users',
            banking: '/api/banking',
            history: '/api/history'
        }
    });
});

// Authentication routes
app.use('/api/auth', (req, res, next) => {
    req.db = db;
    next();
}, authRoutes);

// Banking routes
app.use('/api/banking', (req, res, next) => {
    req.db = db;
    next();
}, bankingRoutes);

// Users routes
app.use('/api/users', (req, res, next) => {
    req.db = db;
    next();
}, usersRoutes);

// History routes
app.use('/api/history', (req, res, next) => {
    req.db = db;
    next();
}, historyRoutes);

app.get('/api/health', asyncHandler(async (req, res) => {
    if (!db) {
        return res.status(500).json({ 
            error: 'Database not connected',
            status: 'unhealthy'
        });
    }
    
    // Test database connection
    await db.admin().ping();
    res.json({ 
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
}));

// Note: /api/users endpoints moved to routes/users.js with service layer

// 404 errors handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableEndpoints: ['/api/health', '/api/auth', '/api/users', '/api/banking', '/api/history']
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: error.message
        });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        return res.status(500).json({
            error: 'Database Error',
            message: 'Error de conexión'
        });
    }
    
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error interno'
    });
});

// Start server
async function startServer() {
    const connected = await connectToDatabase();
    
    if (connected) {
        const server = app.listen(port, () => {
            console.log(`\nServer OK`);
            console.log(`Port: ${port}`);
            console.log(`Database: ${MONGODB_CONFIG.databaseName}`);
            console.log(`Live: http://localhost:${port}/api/health`);
            console.log(`API: http://localhost:${port}/api`);
            console.log('\nAccepting Inbound\n');
        });
        
        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${port} in use`);
            } else {
                console.error('Server error:', error);
            }
            process.exit(1);
        });
        
        return server;
    } else {
        console.error('Failed to start server - Database connection failed');
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    
    
    if (client) {
        await client.close();
        console.log('✅ Database connection closed');
    }
    
    console.log('✅ Server shutdown complete');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nShutting down.');
    
    if (client) {
        await client.close();
        
    }
    
    console.log('Server shutdown complete');
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start the server
startServer().catch(console.error);