# CesdeFin - Mobile Banking Application

A comprehensive mobile banking application developed as a solution for simple checking accounts over CESDE. This project provides a complete banking solution with account management, transactions, deposits, and withdrawals.

## Project Structure

```
cajerovisual/
├── MobileProgramming-CheckingAccountHandler(SpanishBiased)/
│   ├── CesdeFinCliente/          # React + TypeScript Frontend
│   │   ├── src/
│   │   │   ├── components/       # Reusable UI components
│   │   │   ├── pages/           # Application pages
│   │   │   ├── services/        # API services
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── types/           # TypeScript type definitions
│   │   │   ├── styles/          # CSS stylesheets
│   │   │   └── router/          # Application routing
│   │   └── public/              # Static assets
│   │
│   └── CesdeFinServer/          # Node.js + Express Backend
│       ├── routes/              # API route handlers
│       ├── models/              # Database models
│       ├── middleware/         # Express middleware
│       ├── scripts/             # Utility scripts
│       └── docs/                # API documentation
```

## Features

### Frontend (CesdeFinCliente)
- **Authentication**: Login, Signup, Password Management
- **Dashboard**: Account overview and quick actions
- **Deposits**: Bank deposit, Card deposit, Cash deposit
- **Withdrawals**: Withdraw funds from account
- **Transfers**: Transfer between accounts
- **Transaction History**: View past transactions
- **Account Settings**: Profile management and preferences
- **Contact**: Customer support contact

### Backend (CesdeFinServer)
- RESTful API with Express.js
- MongoDB database integration
- JWT-based authentication
- Banking operations API
- User management

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite (build tool)
- React Router (navigation)
- CSS Modules

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Install server dependencies:
   ```bash
   cd MobileProgramming-CheckingAccountHandler\(SpanishBiased\)/CesdeFinServer
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd MobileProgramming-CheckingAccountHandler\(SpanishBiased\)/CesdeFinCliente
   npm install
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env` in both server and client directories
   - Update MongoDB connection string and other settings

5. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd CesdeFinServer
   npm run dev
   
   # Terminal 2 - Frontend
   cd CesdeFinCliente
   npm run dev
   ```

## API Documentation

Detailed API documentation is available in `CesdeFinServer/docs/`:
- [`auth-api.md`](CesdeFinServer/docs/auth-api.md) - Authentication endpoints
- [`banking-api.md`](CesdeFinServer/docs/banking-api.md) - Banking operations
- [`data-migration.md`](CesdeFinServer/docs/data-migration.md) - Data migration guide

## Project Context

This project was developed as part of a homework for mobile programming at Pascual Bravo University in Medellin.

## License

Educational use only.
