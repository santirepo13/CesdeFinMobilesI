# CesdeFin Server Backend

Backend API server for CesdeFin Banking System built with Express.js and MongoDB.

## Features

- ✅ MongoDB connection with configuration
- ✅ Environment variables support
- ✅ Basic user CRUD operations
- ✅ Input validation middleware
- ✅ Database indexes for performance
- ✅ Comprehensive error handling
- ✅ Graceful shutdown procedures
- ✅ CORS support
- ✅ Health check endpoint

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB configuration:
```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/
DB_NAME=CheckingAccountHandler
PORT=3000
```

## Running the Server

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

### Test database connection:
```bash
npm run test:db
```

## API Endpoints

### Health Check
- `GET /api/health` - Check server and database status

### Users
- `GET /api/users` - Get all users (passwords excluded)
- `POST /api/users` - Create a new user

### User Creation Example
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "testuser",
    "clave": "Test123!",
    "nombre": "Test User",
    "correo": "test@example.com",
    "saldo": 1000
  }'
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  usuario: String (unique),
  clave: String,
  nombre: String,
  correo: String (unique),
  saldo: Number,
  movimientos: Array,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

The API returns consistent error responses:
```javascript
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | - |
| `DB_NAME` | Database name | CheckingAccountHandler |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `JWT_SECRET` | JWT secret key (future use) | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |

## Project Structure

```
CesdeFinServer/
├── server.js              # Main server file
├── mongodb-test.js        # Database connection test
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore file
└── README.md             # This file
```

## Next Steps

This is the first feature (`feat/backend-setup`) in the migration plan. The next features to implement are:

1. `feat/auth-api` - Authentication endpoints with JWT
2. `feat/banking-api` - Core banking operations
3. `feat/data-migration` - Migrate existing JSON data to MongoDB
4. `feat/react-foundation` - Setup React frontend

## Contributing

Follow the commit naming convention:
- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `refactor(scope): description` - Code refactoring
- `test(scope): description` - Adding tests
- `docs(scope): description` - Documentation