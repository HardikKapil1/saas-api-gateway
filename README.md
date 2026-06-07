# SaaS API Gateway & Multi-Tenant Backend

A robust, multi-tenant backend infrastructure built with **NestJS**. This platform enables SaaS applications to manage tenant workspaces, handle JWT-based authentication, issue and revoke API keys, and enforce strict per-tenant rate limits using Redis.

---

## 🚀 Features

- **Multi-Tenancy** – Isolated tenant workspaces.
- **Authentication** – Secure JWT-based login for tenant dashboards.
- **API Key Management** – Generate, list, and revoke long-lived `sk_...` API keys for machine-to-machine communication.
- **Rate Limiting** – High-performance, per-tenant request throttling powered by Redis.
- **Dockerized Infrastructure** – Ready to run with MySQL and Redis containers.

---

## 🛠️ Tech Stack

| Category | Technology |
|-----------|------------|
| Framework | Node.js, NestJS, TypeScript |
| Database | MySQL 8, TypeORM |
| Caching & Rate Limiting | Redis 7 |
| Security | Passport, JWT, Bcrypt |
| Infrastructure | Docker, Docker Compose |

---

## ⚙️ Project Setup

### 1. Prerequisites

Ensure you have the following installed:

- Node.js (v18+)
- Docker Desktop

---

### 2. Environment Variables

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=saas_gateway

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

---

### 3. Start Infrastructure

Start MySQL and Redis containers:

```bash
docker-compose up -d
```

---

### 4. Install Dependencies

```bash
npm install
```

---

### 5. Run the Server

Development mode:

```bash
npm run start:dev
```

The server will start at:

```text
http://localhost:3000
```

with the global API prefix:

```text
/api/v1
```

---

# 📡 API Endpoints

## Tenant Registration

### Register Tenant

**POST** `/api/v1/tenants/register`

#### Request Body

```json
{
  "name": "My Company",
  "email": "admin@company.com",
  "password": "secure123"
}
```

#### Action

Creates a new tenant workspace.

---

## Authentication

### Login

**POST** `/api/v1/auth/login`

#### Request Body

```json
{
  "email": "admin@company.com",
  "password": "secure123"
}
```

#### Action

Authenticates the tenant and returns a JWT access token.

---

## API Key Management

> Requires JWT in the `Authorization` header.

```http
Authorization: Bearer <token>
```

### Generate API Key

**POST** `/api/v1/api-keys`

#### Request Body

```json
{
  "name": "Production Key"
}
```

#### Action

Generates a new API key for the authenticated tenant.

#### Sample Response

```json
{
  "apiKey": "sk_xxxxxxxxxxxxxxxxxxxxx"
}
```

---

### List API Keys

**GET** `/api/v1/api-keys`

#### Action

Returns all active API keys for the authenticated tenant.

---

### Revoke API Key

**PATCH** `/api/v1/api-keys/:id/revoke`

#### Action

Soft-deletes (revokes) the specified API key.

---

## Rate Limit Testing

> Requires an API key in the request header.

```http
x-api-key: sk_xxxxxxxxxxxxxxxxxxxxx
```

### Ping Endpoint

**GET** `/api/v1/ping`

#### Action

Protected test route used to:

- Verify API key validation
- Test tenant identification
- Observe Redis rate-limit behavior
- Check remaining/reset headers

#### Example Request

```bash
curl -X GET http://localhost:3000/api/v1/ping \
  -H "x-api-key: sk_xxxxxxxxxxxxxxxxxxxxx"
```

#### Example Response

```json
{
  "message": "pong"
}
```

---

## 🔒 Security Features

- JWT-based authentication
- Bcrypt password hashing
- Tenant-level API isolation
- Revocable API keys
- Redis-backed rate limiting
- Soft deletion for API key revocation

---

## 🐳 Docker Services

| Service | Port |
|----------|------|
| NestJS API | 3000 |
| MySQL | 3306 |
| Redis | 6379 |

---

## 📂 Architecture Overview

```text
Client
   │
   ▼
NestJS API
   │
   ├── JWT Authentication
   ├── Tenant Management
   ├── API Key Validation
   └── Rate Limiter
            │
            ▼
         Redis
            │
            ▼
          MySQL
```

---

## 📜 License

This project is intended for learning, portfolio, and SaaS starter use cases. Feel free to customize and extend it for your needs.