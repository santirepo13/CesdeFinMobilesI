# Data Migration Documentation

## Overview
This document describes the process of migrating user data from the JSON file (`usuarios_realistas.json`) to MongoDB database as part of the CesdeFin Banking System migration project.

## Migration Scripts

### 1. Interactive Migration Script
**File**: `scripts/migrate-users.js`

This script provides an interactive migration experience with user prompts and detailed logging.

#### Usage
```bash
cd CesdeFinServer
node scripts/migrate-users.js
```

#### Features
- Interactive prompts for collection clearing
- Detailed batch processing logs
- Real-time progress updates
- Comprehensive error reporting
- Migration verification

### 2. Automated Migration Script
**File**: `scripts/migrate-users-auto.js`

This script provides a non-interactive migration suitable for automated deployments.

#### Usage
```bash
cd CesdeFinServer
node scripts/migrate-users-auto.js
```

#### Programmatic Usage
```javascript
const { migrateUsers } = require('./scripts/migrate-users-auto');

// Run migration with options
const stats = await migrateUsers({
    clearCollection: true,  // Clear existing data
    silent: false          // Show logs
});
```

## Data Structure

### Source JSON Structure
```json
{
  "usuario": "string",
  "clave": "string", 
  "nombre": "string",
  "correo": "string",
  "saldo": "number",
  "movimientos": [
    {
      "tipo": "string",
      "valor": "number",
      "fecha": "string"
    }
  ]
}
```

### Target MongoDB Schema
```javascript
{
  usuario: String,        // Username (unique)
  clave: String,          // Password
  nombre: String,         // Full name
  correo: String,         // Email (unique)
  saldo: Number,          // Account balance
  movimientos: [{         // Transaction history
    tipo: String,         // Transaction type
    valor: Number,        // Amount
    fecha: String,        // Date
    comision: Number,     // Commission (default: 0)
    neto: Number,         // Net amount (default: valor)
    metodo: String,       // Method (default: "")
    detalle: String       // Details (default: "")
  }],
  createdAt: Date,        // Migration timestamp
  updatedAt: Date         // Last update timestamp
}
```

## Validation Rules

### User Validation
- **usuario**: Required, non-empty string
- **clave**: Required, non-empty string
- **nombre**: Required, non-empty string
- **correo**: Required, valid email format
- **saldo**: Required, non-negative number
- **movimientos**: Required array

### Movement Validation
- **tipo**: Required string
- **valor**: Required number
- **fecha**: Required string

### Data Cleaning
- Trims whitespace from string fields
- Converts email to lowercase
- Parses numeric values with fallbacks
- Adds default values for missing fields
- Adds timestamps for tracking

## Migration Process

### 1. Data Loading
- Reads JSON file from `../../json/usuarios_realistas.json`
- Validates JSON structure
- Reports loading errors

### 2. Validation
- Validates each user record
- Reports validation errors
- Skips invalid records

### 3. Data Cleaning
- Normalizes string fields
- Converts data types
- Adds default values
- Adds timestamps

### 4. Batch Processing
- Processes users in batches of 50
- Handles duplicate users
- Reports batch progress
- Continues on batch errors

### 5. Database Operations
- Connects to MongoDB
- Checks existing data
- Performs bulk inserts
- Handles duplicate key errors

### 6. Verification
- Counts migrated records
- Samples migrated data
- Reports statistics
- Validates success

## Error Handling

### Types of Errors
1. **File Loading Errors**: JSON file not found or invalid format
2. **Validation Errors**: Missing or invalid user data
3. **Database Errors**: Connection issues or write failures
4. **Duplicate Errors**: Existing users in database

### Error Recovery
- Skips invalid records
- Continues processing on batch errors
- Reports all errors at completion
- Provides detailed error context

## Migration Statistics

The migration tracks the following metrics:
- `totalUsers`: Total users in JSON file
- `successfulMigrations`: Users successfully migrated
- `failedMigrations`: Users that failed to migrate
- `duplicateUsers`: Duplicate users found
- `validationErrors`: Users with validation errors
- `errors`: Detailed error list

## Configuration

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `DB_NAME`: Database name (default: CheckingAccountHandler)

### MongoDB Connection Options
```javascript
{
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 5
}
```

## Running the Migration

### Prerequisites
1. MongoDB database accessible
2. Environment variables configured
3. JSON file in correct location
4. Node.js runtime installed

### Steps
1. Navigate to `CesdeFinServer` directory
2. Ensure `.env` file is configured
3. Run migration script
4. Review migration results
5. Verify data in MongoDB

### Example Output
```
====================================
CesdeFin User Migration Tool
====================================

Starting user migration...
JSON file: /path/to/usuarios_realistas.json
Database: CheckingAccountHandler
Loaded 100 users from JSON file
Connected to MongoDB

Processing 2 batches of 50 users each...

Processing batch 1/2 (50 users)
Inserted 50 users

Processing batch 2/2 (50 users)
Inserted 50 users

Verifying migration...
Migration Statistics:
   Total users in JSON: 100
   Successfully migrated: 100
   Failed migrations: 0
   Duplicate users: 0
   Validation errors: 0
   Total users in DB: 100

Sample migrated users:
   1. candido06153 - Eloy Bonet Ramón - Saldo: $190,339
   2. azahara73517 - Joel Arco-Mayol - Saldo: $189,750
   3. bnavarrete995 - Verónica Beltrán Saura - Saldo: $70,003

SUCCESS Migration completed successfully

MongoDB connection closed
```

## Post-Migration Verification

### Database Queries
```javascript
// Count total users
db.users.countDocuments()

// Check sample users
db.users.find().limit(5)

// Verify user structure
db.users.findOne()

// Check for duplicates
db.users.aggregate([
  { $group: { _id: "$usuario", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

### API Verification
- Test user login with migrated accounts
- Verify balance display
- Check transaction history
- Test banking operations

## Troubleshooting

### Common Issues
1. **Connection Failed**: Check MongoDB URI and network
2. **File Not Found**: Verify JSON file path
3. **Validation Errors**: Check JSON data format
4. **Duplicate Users**: Clear collection before migration

### Solutions
- Verify environment variables
- Check file permissions
- Validate JSON format
- Use clearCollection option

## Rollback Plan

If migration fails or needs to be reverted:
1. Stop application
2. Clear users collection: `db.users.deleteMany({})`
3. Restore from backup if available
4. Re-run migration with fixes

## Best Practices

1. **Backup**: Always backup database before migration
2. **Test**: Run migration in development first
3. **Monitor**: Watch for errors during migration
4. **Verify**: Check data after migration
5. **Document**: Record migration results and issues