# CesdeFin Banking API Documentation

## Overview
The Banking API provides endpoints for all core banking operations including deposits, withdrawals, transfers, and balance inquiries. All endpoints require authentication.

## Base URL
```
http://localhost:3000/api/banking
```

## Authentication
All banking endpoints require authentication. Include the session cookie from the login response in all subsequent requests.

## Commission Rates
- **Bank Deposit (banco)**: 1%
- **Card Deposit (tarjeta)**: 2.5%
- **Cash Deposit (efectivo)**: 0.5%
- **Transfer (transferencia)**: 0.25%

## Endpoints

### 1. Deposit Money
**POST** `/deposit`

Deposits money into the user's account with commission based on the deposit method.

#### Request Body
```json
{
  "amount": 100000,
  "method": "banco",
  "detail": "Bancolombia"
}
```

#### Parameters
- `amount` (number, required): Deposit amount (must be positive)
- `method` (string, required): Deposit method (`banco`, `tarjeta`, `efectivo`)
- `detail` (string, optional): Additional details about the deposit

#### Response
```json
{
  "success": true,
  "message": "Depósito realizado exitosamente",
  "data": {
    "amount": 100000,
    "commission": 1000,
    "netAmount": 99000,
    "method": "banco",
    "newBalance": 199000,
    "transaction": {
      "tipo": "consignación",
      "valor": 100000,
      "comision": 1000,
      "neto": 99000,
      "metodo": "Banco",
      "detalle": "Bancolombia",
      "fecha": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Error Responses
- `400`: Invalid amount or method
- `404`: User not found
- `500`: Internal server error

---

### 2. Withdraw Money
**POST** `/withdraw`

Withdraws money from the user's account and generates a withdrawal code.

#### Request Body
```json
{
  "amount": 50000
}
```

#### Parameters
- `amount` (number, required): Withdrawal amount (must be positive and not exceed balance)

#### Response
```json
{
  "success": true,
  "message": "Retiro realizado exitosamente",
  "data": {
    "amount": 50000,
    "withdrawalCode": "123456",
    "newBalance": 149000,
    "transaction": {
      "tipo": "retiro",
      "valor": -50000,
      "comision": 0,
      "neto": -50000,
      "metodo": "",
      "detalle": "Código de retiro: 123456",
      "fecha": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

#### Error Responses
- `400`: Invalid amount or insufficient funds
- `404`: User not found
- `500`: Internal server error

---

### 3. Transfer Money
**POST** `/transfer`

Transfers money from the current user to another user with commission.

#### Request Body
```json
{
  "targetUser": "juanperez",
  "amount": 30000
}
```

#### Parameters
- `targetUser` (string, required): Username of the recipient
- `amount` (number, required): Transfer amount (must be positive and not exceed balance)

#### Response
```json
{
  "success": true,
  "message": "Transferencia realizada exitosamente",
  "data": {
    "amount": 30000,
    "commission": 75,
    "netAmount": 29925,
    "targetUser": "juanperez",
    "newBalance": 118925,
    "originTransaction": {
      "tipo": "transferencia",
      "valor": -30000,
      "comision": 75,
      "neto": -30000,
      "metodo": "",
      "detalle": "Transferencia a juanperez",
      "fecha": "2024-01-15T10:40:00.000Z"
    },
    "targetTransaction": {
      "tipo": "transferencia",
      "valor": 29925,
      "comision": 0,
      "neto": 29925,
      "metodo": "",
      "detalle": "Transferencia de admin",
      "fecha": "2024-01-15T10:40:00.000Z"
    }
  }
}
```

#### Error Responses
- `400`: Invalid amount, insufficient funds, or invalid target user
- `404`: User not found
- `500`: Internal server error

---

### 4. Get Balance
**GET** `/balance`

Retrieves the current user's balance information.

#### Response
```json
{
  "success": true,
  "data": {
    "usuario": "admin",
    "nombre": "Administrador",
    "saldo": 118925,
    "lastUpdated": "2024-01-15T10:40:00.000Z"
  }
}
```

#### Error Responses
- `404`: User not found
- `500`: Internal server error

---

### 5. Get Transaction History
**GET** `/transactions`

Retrieves the user's transaction history with pagination support.

#### Query Parameters
- `limit` (number, optional): Number of transactions to return (default: 50)
- `offset` (number, optional): Number of transactions to skip (default: 0)
- `type` (string, optional): Filter by transaction type (`consignación`, `retiro`, `transferencia`)

#### Example Request
```
GET /transactions?limit=10&offset=0&type=consignación
```

#### Response
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "tipo": "consignación",
        "valor": 100000,
        "comision": 1000,
        "neto": 99000,
        "metodo": "Banco",
        "detalle": "Bancolombia",
        "fecha": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 10,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

#### Error Responses
- `404`: User not found
- `500`: Internal server error

---

### 6. Get Commission Rates
**GET** `/commission-rates`

Retrieves the current commission rates for all operations.

#### Response
```json
{
  "success": true,
  "data": {
    "commissionRates": {
      "banco": 0.01,
      "tarjeta": 0.025,
      "efectivo": 0.005,
      "transferencia": 0.0025
    },
    "formatted": {
      "banco": "1%",
      "tarjeta": "2.5%",
      "efectivo": "0.5%",
      "transferencia": "0.25%"
    }
  }
}
```

---

## Error Handling

All endpoints may return the following common error responses:

### 401 Unauthorized
```json
{
  "error": "No autorizado",
  "message": "Debe iniciar sesión para acceder a este recurso"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error interno del servidor",
  "message": "No se pudo procesar la solicitud"
}
```

## Testing with Postman

1. **Login First**: Authenticate with `/api/auth/login`
2. **Save Session Cookie**: The login response will include a session cookie
3. **Include Cookie**: Include the session cookie in all banking API requests
4. **Test Endpoints**: Use the examples above to test each endpoint

## Example Postman Collection

### Deposit Request
```http
POST http://localhost:3000/api/banking/deposit
Content-Type: application/json
Cookie: connect.sid=your-session-cookie

{
  "amount": 100000,
  "method": "banco",
  "detail": "Bancolombia"
}
```

### Withdraw Request
```http
POST http://localhost:3000/api/banking/withdraw
Content-Type: application/json
Cookie: connect.sid=your-session-cookie

{
  "amount": 50000
}
```

### Transfer Request
```http
POST http://localhost:3000/api/banking/transfer
Content-Type: application/json
Cookie: connect.sid=your-session-cookie

{
  "targetUser": "juanperez",
  "amount": 30000
}
```

## Notes

- All monetary values are in Colombian Pesos (COP)
- Commissions are automatically calculated and deducted
- Transactions are immutable once created
- All operations update the user's balance immediately
- The system uses database transactions for transfer operations to ensure data consistency