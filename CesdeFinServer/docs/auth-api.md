# Authentication API Documentation

## Base URL
`http://localhost:3000/api/auth`

## Endpoints

### 1. Register User
**POST** `/register`

Registers a new user in the system.

#### Request Body
```json
{
    "usuario": "string (3-50 chars, unique)",
    "clave": "string (8+ chars, must contain uppercase, lowercase, numbers, and symbols)",
    "nombre": "string (max 100 chars)",
    "correo": "string (valid email, unique)"
}
```

#### Response
- **201 Created**:
```json
{
    "success": true,
    "message": "Usuario registrado exitosamente",
    "user": {
        "id": "string",
        "usuario": "string",
        "nombre": "string",
        "correo": "string",
        "saldo": 0
    }
}
```

- **400 Bad Request**:
```json
{
    "error": "Error message"
}
```

### 2. Login
**POST** `/login`

Authenticates a user and creates a session.

#### Request Body
```json
{
    "identifier": "string (username or email)",
    "clave": "string (password)"
}
```

#### Response
- **200 OK**:
```json
{
    "success": true,
    "message": "Inicio de sesión exitoso",
    "user": {
        "id": "string",
        "usuario": "string",
        "nombre": "string",
        "correo": "string",
        "saldo": "number"
    }
}
```

- **401 Unauthorized**:
```json
{
    "error": "Credenciales inválidas"
}
```

### 3. Logout
**POST** `/logout`

Ends the user's session.

#### Response
- **200 OK**:
```json
{
    "success": true,
    "message": "Sesión cerrada exitosamente"
}
```

### 4. Check Authentication Status
**GET** `/status`

Checks if the user is authenticated.

#### Response
- **200 OK** (Authenticated):
```json
{
    "authenticated": true,
    "user": {
        "id": "string",
        "usuario": "string",
        "nombre": "string",
        "correo": "string",
        "saldo": "number"
    }
}
```

- **200 OK** (Not Authenticated):
```json
{
    "authenticated": false
}
```

## Password Validation Rules
Passwords must meet the following criteria:
- At least 8 characters long
- Contains at least one uppercase letter
- Contains at least one lowercase letter
- Contains at least one number
- Contains at least one special character (@$!%*?&)

## Session Management
- Sessions are stored server-side with a cookie
- Session duration: 24 hours
- Sessions are automatically destroyed on logout
- In production, use secure cookies (HTTPS)

## Error Codes
- **400**: Bad Request (validation errors, missing fields)
- **401**: Unauthorized (invalid credentials, not authenticated)
- **500**: Internal Server Error (database errors, server issues)

## Testing with curl

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"usuario":"testuser","clave":"Test123@","nombre":"Test User","correo":"test@example.com"}' \
  -c cookies.txt
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"testuser","clave":"Test123@"}' \
  -c cookies.txt
```

### Check status:
```bash
curl -X GET http://localhost:3000/api/auth/status \
  -b cookies.txt
```

### Logout:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## Protected Routes
Routes that require authentication will return a 401 error if the user is not logged in:
```json
{
    "error": "No autenticado",
    "message": "Debe iniciar sesión para acceder a este recurso"
}