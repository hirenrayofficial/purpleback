# PurpleBack - Authentication API Server

A Node.js Express-based backend service with MongoDB integration, featuring user authentication, authorization, and role-based access control.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [How to Start](#how-to-start)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Technologies Used](#technologies-used)
- [License](#license)

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (usually comes with Node.js)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)

## Installation

1. **Clone or download the project**

   ```bash
   cd /path/to/purpleback
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This will install all required packages listed in `package.json`:
   - Express.js - Web framework
   - Mongoose - MongoDB ODM
   - JWT (jsonwebtoken) - Authentication tokens
   - Bcrypt - Password hashing
   - CORS - Cross-Origin Resource Sharing
   - And other utilities

## Configuration

### 1. Create Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=4000

# MongoDB Configuration
MONGO_URL_STRING=mongodb://localhost:27017/purpleback
# OR for MongoDB Atlas:
# MONGO_URL_STRING=mongodb+srv://username:password@cluster.mongodb.net/purpleback

# JWT Configuration (if needed)
JWT_SECRET=your_jwt_secret_key_here

# CORS Configuration (already set in code)
# Origin: https://purple.hirenray.rest
```

> **Note:** The `.env` file should never be committed to version control. Add it to your `.gitignore` file.

### 2. MongoDB Setup

**Option A: Local MongoDB**
- Install MongoDB Community Edition
- Ensure MongoDB service is running on your machine
- Update `MONGO_URL_STRING` in `.env` to: `mongodb://localhost:27017/purpleback`

**Option B: MongoDB Atlas (Cloud)**
- Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and database
- Get your connection string
- Add your IP to the network access whitelist
- Update `MONGO_URL_STRING` in `.env` with your connection string

## How to Start

### Development Mode (with auto-reload)

```bash
npm run dev
```

This command uses **Nodemon** to automatically restart the server when you make changes to your code. Ideal for development.

**Output:**
```
Server is running on port 4000
MongoDB Connected
```

### Production Mode

```bash
npm start
```

Starts the server normally without file watching. Recommended for production environments.

**Output:**
```
Server is running on port 4000
MongoDB Connected
```

### Access the Server

Once running, your server will be available at:
- **Local:** `http://localhost:4000`
- **API Endpoints:** 
  - Login API: `http://localhost:4000/api/v1`
  - Access API: `http://localhost:4000/api/v2`

## Project Structure

```
purpleback/
├── index.js                          # Main application entry point
├── package.json                      # Project metadata and dependencies
├── .env                              # Environment variables (not in git)
├── README.md                         # This file
│
├── auth/                             # Authentication modules
│   ├── auth.js                       # Main authentication logic
│   ├── userAuth.js                   # User authentication
│   ├── adminAuth.js                  # Admin authentication
│   ├── managerAuth.js                # Manager authentication
│   └── maAuth.js                     # Multi-admin authentication
│
├── controller/                       # Route controllers (business logic)
│   ├── authController.js             # Authentication controller
│   └── userController.js             # User management controller
│
├── modules/                          # Mongoose data models
│   ├── user.module.js                # User schema
│   └── subUser.module.js             # Sub-user schema
│
├── router/                           # API route handlers
│   ├── loginRouter.js                # Login/authentication routes (/api/v1)
│   └── accesRouter.js                # Access control routes (/api/v2)
│
└── services/                         # External services
    └── mongoDb/
        └── db.js                     # MongoDB connection logic
```

## API Endpoints

### Authentication Routes (/api/v1 - loginRouter)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/login` | User login |
| POST | `/api/v1/register` | User registration |
| POST | `/api/v1/logout` | User logout |

### Access Control Routes (/api/v2 - accessRouter)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/users` | Get all users |
| GET | `/api/v2/users/:id` | Get user by ID |
| POST | `/api/v2/users` | Create new user |
| PUT | `/api/v2/users/:id` | Update user |
| DELETE | `/api/v2/users/:id` | Delete user |

> **Note:** Specific endpoints depend on your router implementation. Refer to `/router` directory for actual routes.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `4000` |
| `MONGO_URL_STRING` | MongoDB connection string | `mongodb://localhost:27017/purpleback` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |

## Available Scripts

```bash
# Start server (production)
npm start

# Start server with auto-reload (development)
npm run dev
```

## Technologies Used

- **Express.js** (^5.2.1) - Web application framework
- **Node.js** - JavaScript runtime
- **MongoDB** (via Mongoose ^9.4.1) - NoSQL database
- **JWT** (jsonwebtoken ^9.0.3) - Authentication tokens
- **Bcrypt** (^6.0.0) - Password hashing
- **CORS** (^2.8.6) - Cross-Origin Resource Sharing
- **Cookie-Parser** (^1.4.7) - Cookie parsing middleware
- **Body-Parser** (^2.2.2) - Request body parsing
- **Nodemon** (^3.1.14) - Development auto-reload tool
- **UUID** (^13.0.0) - Unique identifier generation

## Troubleshooting

### 1. MongoDB Connection Failed

**Error:** `Error: connect ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running
- Check `MONGO_URL_STRING` in `.env` file
- Verify MongoDB credentials for Atlas

### 2. Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::4000`

**Solution:**
- Change `PORT` in `.env` to an available port (e.g., 5000)
- Or kill the process using the port

### 3. Dependencies Not Installed

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

ISC

---

**For more information or support, contact the development team.**
