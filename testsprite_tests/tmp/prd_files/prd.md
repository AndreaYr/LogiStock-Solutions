# LogiStock Solutions — Product Requirements Document

## 1. Overview
LogiStock Solutions is a backend REST API for a Warehouse Management System.
It exposes authentication, user management, role-based access control,
email notifications, and Wompi payment gateway integration.

## 2. Authentication Module
### 2.1 Register
- **POST /api/auth/register**
- Body: { firstName, lastName, email, password, phone? }
- Creates user with CLIENT role
- Returns: { accessToken, refreshToken }
- Errors: 409 if email already registered, 400 if missing fields

### 2.2 Login
- **POST /api/auth/login**
- Body: { email, password }
- Returns: { accessToken, refreshToken }
- Locks account after 5 failed attempts
- Sends login alert email on success
- Errors: 401 for invalid credentials or locked account

### 2.3 Refresh Token
- **POST /api/auth/refresh**
- Body: { refreshToken }
- Returns: { accessToken }
- Errors: 401 if token invalid or expired

### 2.4 Logout
- **POST /api/auth/logout**
- Body: { refreshToken }
- Revokes refresh token
- Returns: 200 { message }

## 3. User Management Module
All routes require Bearer JWT token.

### 3.1 List Users (ADMIN only)
- **GET /api/users**
- Returns array of users without passwords

### 3.2 Own Profile
- **GET /api/users/me**
- Returns authenticated user's profile

### 3.3 Get User by ID
- **GET /api/users/:id**
- Own profile or ADMIN only
- 403 if trying to access another user's profile without ADMIN role

### 3.4 Update Profile
- **PUT /api/users/:id**
- Body: { firstName?, lastName?, phone? }

### 3.5 Change Password
- **PATCH /api/users/:id/password**
- Body: { currentPassword, newPassword }
- Only own account

### 3.6 Deactivate Account (ADMIN only)
- **DELETE /api/users/:id**
- Sets isActive = false

## 4. Role Management Module
All routes require ADMIN role.

### 4.1 List Roles
- **GET /api/roles**

### 4.2 Get Role by ID
- **GET /api/roles/:id**

## 5. Wompi Payment Gateway Module

### 5.1 Generate Signature
- **POST /api/wompi/signature** (requires JWT)
- Body: { reference, amountInCents, currency }
- Returns: { signature, publicKey }
- Used by frontend before opening the Wompi widget

### 5.2 Handle Webhook
- **POST /api/wompi/webhook** (PUBLIC — no JWT)
- Receives Wompi transaction events
- Verifies SHA-256 checksum
- Persists/updates transaction in payment_transactions table
- Returns: 200 { received: true }
- Returns: 401 if checksum invalid

### 5.3 Get Transaction
- **GET /api/wompi/transactions/:id** (requires JWT)
- Queries Wompi API for transaction status

## 6. Security Requirements
- All protected routes require Authorization: Bearer {accessToken}
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Passwords hashed with bcrypt (12 rounds)
- Account blocked after 5 failed login attempts in 15 minutes
