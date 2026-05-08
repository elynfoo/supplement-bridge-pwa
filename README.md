# Supplement Bridge - Azure Cloud Architecture

A cloud-based e-commerce platform connecting customers with trusted supplement providers. Built on Microsoft Azure with a full CI/CD pipeline.

## Live URLs

| Environment | URL |
|---|---|
| Production | https://supplement-bridge-a8anhmbfcydufcat.southeastasia-01.azurewebsites.net|  https://supplement-bridge-a8anhmbfcydufcat.southeastasia-01.azurewebsites.net/admin
| Dev | https://supplement-bridge-dev.azurewebsites.net | https://supplement-bridge-dev.azurewebsites.net/admin

## Architecture

### What is Implemented

```
Users → Azure App Service (Express + React)
             ├── Backend: Node.js Express API
             └── Frontend: React (served by Express)
```

| Component | Status | Notes |
|---|---|---|
| Azure App Service | Deployed | Hosts both frontend and backend |
| Azure Pipelines CI/CD | Deployed | Auto-deploys on push to main |
| JWT Authentication | Deployed | Login, admin roles |
| Bicep IaC | Ready | Defines infra for new environments |
| Azure Key Vault | Bicep only | Not yet deployed |
| Azure SQL Database | Bicep only | Using in-memory mock data |
| Azure Storage Account | Bicep only | Not yet deployed |
| Azure Monitor / App Insights | Bicep only | Not yet deployed |

### Planned (from Architecture Diagram)

| Component | Purpose |
|---|---|
| Azure Front Door + WAF | Global load balancing, DDoS protection |
| Azure Static Web Apps | Separate frontend hosting |
| Azure API Management | API gateway, rate limiting |
| Azure Functions | Serverless background tasks |
| Azure Redis Cache | Session and data caching |
| Microsoft Entra ID | Enterprise authentication |
| Azure CDN | Static asset delivery |
| Azure Defender | Threat detection |

## CI/CD Pipeline

Using **Azure Pipelines** (not GitHub Actions as shown in the architecture diagram):

```
Push to main
    ↓
Build Stage
  - Install & build React frontend
  - Copy frontend into Express backend
  - Zip and publish artifact
    ↓
Deploy Dev
  - Deploy to supplement-bridge-dev App Service
    ↓
Deploy Prod
  - Deploy to supplement-bridge App Service
```

## Quick Start (Local Development)

### Backend
```bash
cd backend
npm install
npm run dev
```
Server runs on `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm start
```
App runs on `http://localhost:3000`

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Customer | demo@customer.com | Demo123! |
| Admin | admin@healthsupp.com | Admin123! |

## API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/products` | GET | Get all products |
| `/api/products/:id` | GET | Get product by ID |
| `/api/search?q=query` | GET | Search products |
| `/api/quiz` | GET | Get health quiz questions |
| `/api/quiz/submit` | POST | Submit quiz and get recommendations |
| `/api/checkout` | POST | Process checkout |
| `/api/auth/login` | POST | User login |
| `/api/admin/stats` | GET | Admin dashboard stats |
| `/api/health` | GET | Health check |

## Features

- Browse & search supplements
- 3-question personalized health quiz
- Product recommendations based on quiz answers
- Shopping cart and checkout
- Admin dashboard (products, orders, inventory)
- PWA — installable on mobile and desktop

## Infrastructure as Code

Bicep templates in `infra/` can spin up a full environment with one command:

```bash
az deployment group create \
  --resource-group supplement-bridge-uat-rg \
  --template-file infra/main.bicep \
  --parameters environmentName=uat \
               sqlAdminLogin=sqladmin \
               sqlAdminPassword=YourPassword123!
```

Supported environments: `dev`, `staging`, `uat`, `prod` 

dev — supplement-bridge-dev App Service ✓
prod — supplement-bridge App Service ✓
staging — not created yet
uat — not created yet

## Tech Stack

- **Frontend:** React 18, Axios, PWA (Service Worker)
- **Backend:** Node.js, Express, JWT, bcryptjs
- **Cloud:** Microsoft Azure (App Service)
- **CI/CD:** Azure Pipelines
- **IaC:** Azure Bicep
