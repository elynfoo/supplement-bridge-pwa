# HealthSupp PWA - Phased Azure Architecture
## Phase 1 (MVP - Week 1-4) + Phase 2 (Scale - Week 5+)

```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                                USER JOURNEY FLOW                                       ║
╠════════════════════════════════════════════════════════════════════════════════════════╣
║  Users  →  Browse  →  Quiz  →  Recommend  →  Add Cart  →  Checkout  →  Confirm      ║
║                                                                                         ║
║  CI/CD Pipeline (GitHub Actions)                                                      ║
║  [Code Push] → [Test] → [Build] → [Deploy to Staging] → [Deploy to Prod]            ║
╚════════════════════════════════════════════════════════════════════════════════════════╝


╔════════════════════════════════════════════════════════════════════════════════════════╗
║                          PHASE 1: MINIMAL PRODUCTION (Week 1-4)                        ║
║                              Cost: $70-400/month                                       ║
╚════════════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER (INGRESS)                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🟢 PHASE 1: Azure Static Web Apps              🟢 PHASE 1: Azure Application Gateway  │
│  ├─ Frontend PWA (React)                        ├─ Route requests                      │
│  ├─ Auto CDN & compression                      ├─ SSL/TLS termination                 │
│  ├─ $0 (free tier) / $20-50/mo (scale)          └─ IP whitelisting                     │
│  └─ Perfect for: SPA, PWA, SSG                                                         │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐       │
│  │ Users Access PWA via: https://yourdomain.com                              │       │
│  └─────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER (COMPUTE)                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🟢 PHASE 1: Azure App Service (Backend API)                                            │
│  ├─ Node.js/Express REST API                                                           │
│  ├─ Business logic: Quiz engine, recommendations, checkout                             │
│  ├─ Single instance (B2): $55-200/mo                                                   │
│  └─ Auto-scale later when traffic increases                                            │
│                                                                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐      │
│  │ API Endpoints:                                                               │      │
│  │ GET  /api/products              (Browse products)                            │      │
│  │ GET  /api/search?q=query        (Search)                                     │      │
│  │ GET  /api/quiz                  (Health quiz questions)                      │      │
│  │ POST /api/quiz/submit           (Get recommendations)                        │      │
│  │ POST /api/checkout              (Process order)                              │      │
│  └──────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                          │
│  🟡 PHASE 2: Azure Functions (Optional)                                                │
│  ├─ Serverless recommendation engine                                                   │
│  ├─ Triggered by: POST /api/quiz/submit                                               │
│  ├─ Auto-scale: $0 if <1M invocations/month                                            │
│  └─ When: High traffic spikes detected                                                 │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER (PERSISTENCE)                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🟢 PHASE 1: Azure SQL Database (Transactional Data)                                    │
│  ├─ Tables: Products, Orders, Users, Inventory                                         │
│  ├─ Basic tier: $15-50/mo (5GB)                                                        │
│  ├─ Standard tier: $50-150/mo (50GB+)                                                  │
│  ├─ Daily automated backups                                                            │
│  └─ Connection pooling via App Service                                                 │
│                                                                                          │
│  Schema:                                                                                │
│  ├─ Products (id, name, price, category, ingredients)                                  │
│  ├─ Orders (id, userId, items, total, status, createdAt)                               │
│  ├─ Users (id, email, name, address, createdAt)                                        │
│  └─ Inventory (id, productId, quantity, warehouse)                                     │
│                                                                                          │
│  ────────────────────────────────────────────────────────────────────────────────      │
│                                                                                          │
│  🟢 PHASE 1: Azure Storage Account                                                      │
│  ├─ Product images (blob storage)                                                      │
│  ├─ Application logs (table storage)                                                   │
│  ├─ Database backups                                                                   │
│  ├─ Standard LRS: $1-20/mo (50GB)                                                      │
│  └─ CDN-enabled for fast image delivery                                                │
│                                                                                          │
│  ────────────────────────────────────────────────────────────────────────────────      │
│                                                                                          │
│  🟡 PHASE 2: Azure Cache for Redis (Performance)                                       │
│  ├─ Cache: Products catalog, user sessions                                             │
│  ├─ TTL: 1 hour for products, 24 hours for recommendations                             │
│  ├─ Basic tier: $15-50/mo (250MB)                                                      │
│  ├─ Reduces SQL queries by 70-80%                                                      │
│  └─ When: SQL response time > 200ms or CPU > 70%                                       │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY & IDENTITY LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🟢 PHASE 1: Azure Entra ID (Authentication & RBAC)                                     │
│  ├─ User sign-up / sign-in                                                             │
│  ├─ Role-based access: Customer, Admin                                                 │
│  ├─ Free tier: Up to 500K monthly active users                                         │
│  ├─ SSO integration (optional: Google, Microsoft)                                      │
│  └─ Token-based auth (JWT or cookies)                                                  │
│                                                                                          │
│  ────────────────────────────────────────────────────────────────────────────────      │
│                                                                                          │
│  🟢 PHASE 1: Azure Key Vault (Secrets Management)                                       │
│  ├─ Store: DB connection strings, API keys, certificates                              │
│  ├─ Standard tier: $0.50-1/mo (10 secrets)                                             │
│  ├─ Auto-rotate secrets                                                                │
│  ├─ Audit logging enabled                                                              │
│  └─ Access via: Managed Identity (App Service)                                         │
│                                                                                          │
│  ────────────────────────────────────────────────────────────────────────────────      │
│                                                                                          │
│  🟢 PHASE 1: Network Security Groups (NSGs)                                             │
│  ├─ Inbound rules: Allow HTTPS (443) only                                              │
│  ├─ Outbound rules: App Service → SQL DB → Storage                                     │
│  ├─ Block non-approved IPs                                                             │
│  └─ Free (included with VNet)                                                          │
│                                                                                          │
│  ────────────────────────────────────────────────────────────────────────────────      │
│                                                                                          │
│  🟡 PHASE 2: Azure API Management (API Gateway)                                        │
│  ├─ Rate limiting: 100 req/min per user                                                │
│  ├─ API versioning: /api/v1, /api/v2                                                   │
│  ├─ Developer portal for 3rd-party clients                                             │
│  ├─ Developer tier: $50/mo                                                             │
│  └─ When: Multiple external API consumers                                              │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                      MONITORING & OBSERVABILITY LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🟢 PHASE 1: Application Insights (Full-Stack Observability)                            │
│  ├─ Real-time error tracking & alerts                                                  │
│  ├─ Performance metrics (response time, CPU, memory)                                    │
│  ├─ Custom events (quiz completion, checkout flow)                                     │
│  ├─ KQL queries for deep analysis                                                      │
│  ├─ Free tier: 1GB/month → $2-50/mo for more                                           │
│  ├─ Dashboards: Orders, conversions, errors                                            │
│  └─ Alerts: DB down, API errors > 100, response time > 1s                              │
│                                                                                          │
│  ────────────────────────────────────────────────────────────────────────────────      │
│                                                                                          │
│  🟢 PHASE 1: Azure Monitor (Infrastructure Monitoring)                                  │
│  ├─ App Service health & scaling metrics                                               │
│  ├─ SQL DB CPU, storage, connections                                                   │
│  ├─ Storage Account throughput & latency                                               │
│  ├─ Included with Azure subscription                                                   │
│  └─ Custom alerts on thresholds                                                        │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         CI/CD & DEVOPS PIPELINE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🟢 PHASE 1: GitHub Actions (CI/CD Automation)                                          │
│                                                                                          │
│  Workflow:                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────┐      │
│  │ [Developer Pushes Code] → [GitHub Actions Triggered]                         │      │
│  │         ↓                                                                     │      │
│  │   ┌─────────────────────────┐                                               │      │
│  │   │ 1. Build & Test         │  (npm install, npm run test)                  │      │
│  │   └────────┬────────────────┘                                               │      │
│  │            ↓                                                                 │      │
│  │   ┌─────────────────────────┐                                               │      │
│  │   │ 2. Build Docker Image   │  (docker build)                               │      │
│  │   └────────┬────────────────┘                                               │      │
│  │            ↓                                                                 │      │
│  │   ┌─────────────────────────┐                                               │      │
│  │   │ 3. Push to Registry     │  (acr.azurecr.io/healthsupp:v1.0)             │      │
│  │   └────────┬────────────────┘                                               │      │
│  │            ↓                                                                 │      │
│  │   ┌─────────────────────────────────────────┐                               │      │
│  │   │ 4. Deploy to Environments (Dev/Staging) │                               │      │
│  │   └────────┬────────────────────────────────┘                               │      │
│  │            ↓                                                                 │      │
│  │   ┌─────────────────────────┐                                               │      │
│  │   │ 5. Run Smoke Tests      │  (Check health endpoints)                     │      │
│  │   └────────┬────────────────┘                                               │      │
│  │            ↓                                                                 │      │
│  │   ┌─────────────────────────┐                                               │      │
│  │   │ 6. Manual Approval      │  (Require approval for PROD)                  │      │
│  │   └────────┬────────────────┘                                               │      │
│  │            ↓                                                                 │      │
│  │   ┌─────────────────────────┐                                               │      │
│  │   │ 7. Deploy to Production │  (App Service slot swap)                      │      │
│  │   └────────┬────────────────┘                                               │      │
│  │            ↓                                                                 │      │
│  │   ┌─────────────────────────┐                                               │      │
│  │   │ 8. Monitor & Rollback   │  (Watch Application Insights)                 │      │
│  │   └─────────────────────────┘                                               │      │
│  └──────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                          │
│  Configuration:                                                                         │
│  ├─ Trigger: main branch push                                                          │
│  ├─ Environments: dev (auto), staging (auto), prod (manual approval)                    │
│  ├─ Secrets: Stored in GitHub Secrets (API keys, credentials)                          │
│  ├─ Notifications: Slack on success/failure                                            │
│  └─ Cost: Free tier (2,000 min/month)                                                  │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

```

---

## 📊 Phase 1 vs Phase 2 Comparison

```
╔════════════════════════════════════════════════════════════════════════════════════════╗
║                            PHASED DEPLOYMENT TIMELINE                                  ║
╠════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                         ║
║  PHASE 1 (Week 1-4): LAUNCH MVP                                                       ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                                  ║
║  ✅ Static Web Apps (Frontend)                  $0-50/mo                                ║
║  ✅ App Service (Backend)                       $55-200/mo                              ║
║  ✅ SQL Database (Data)                         $15-100/mo                              ║
║  ✅ Storage Account (Assets/Logs)               $1-20/mo                                ║
║  ✅ Entra ID (Auth)                             $0/mo                                   ║
║  ✅ Key Vault (Secrets)                         $0.50-1/mo                              ║
║  ✅ Application Insights (Monitoring)           $5-20/mo                                ║
║  ✅ GitHub Actions (CI/CD)                      $0/mo (free tier)                       ║
║                                                                                         ║
║  Monthly Cost: $76-391                                                                 ║
║  Time to Production: 2-4 weeks                                                         ║
║  Users Supported: Up to 10K/month                                                      ║
║                                                                                         ║
║  ════════════════════════════════════════════════════════════════════════════════════  ║
║                                                                                         ║
║  PHASE 2 (Week 5+): ADD PERFORMANCE & SCALE                                            ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                              ║
║  ⏳ Azure Functions (Serverless)                $0-50/mo                                ║
║  ⏳ Redis Cache (Performance)                   $15-50/mo                               ║
║  ⏳ API Management (API Gateway)                $50/mo                                  ║
║                                                                                         ║
║  Cumulative Cost: $141-541                                                             ║
║  Users Supported: Up to 100K/month                                                     ║
║                                                                                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 🎯 When to Upgrade to Phase 2

```
Monitor These Metrics (from Application Insights):

┌─────────────────────────────────────────────────────────────────┐
│ Metric                    │ Phase 1 Limit     │ Trigger Phase 2   │
├─────────────────────────────────────────────────────────────────┤
│ API Response Time         │ < 500ms           │ > 1000ms          │
│ SQL DB CPU                │ < 70%             │ > 85%             │
│ App Service CPU           │ < 70%             │ > 85%             │
│ Concurrent Users          │ < 1000            │ > 5000            │
│ Daily API Requests        │ < 1M              │ > 5M              │
│ Quiz Recommendation Time  │ < 2s              │ > 5s              │
│ Error Rate                │ < 0.1%            │ > 1%              │
└─────────────────────────────────────────────────────────────────┘

When 3+ metrics hit trigger threshold → Upgrade to Phase 2
```

---

## 📋 Implementation Roadmap

```
WEEK 1: Foundation
├─ Day 1-2: Docker & CI/CD setup
├─ Day 3: Azure SQL Database creation & schema
├─ Day 4-5: Deploy backend to App Service
└─ Day 6-7: Deploy frontend to Static Web Apps
    Status: ✅ LIVE (but no auth yet)

WEEK 2: Security
├─ Day 8: Setup Entra ID authentication
├─ Day 9: Integrate Key Vault for secrets
├─ Day 10: Configure NSGs
├─ Day 11-12: Test login flow
└─ Day 13-14: Security testing & hardening
    Status: ✅ SECURED

WEEK 3: DevOps
├─ Day 15: GitHub Actions pipeline setup
├─ Day 16: Environment configs (dev/staging/prod)
├─ Day 17: Application Insights dashboard
├─ Day 18-19: Setup alerts & monitoring
└─ Day 20-21: Load testing & optimization
    Status: ✅ MONITORED

WEEK 4: Polish & Launch
├─ Day 22-24: Performance tuning
├─ Day 25: Full journey testing
├─ Day 26-27: Documentation & runbooks
├─ Day 28: Team training
└─ Day 29-30: Go-live preparation
    Status: ✅ PRODUCTION READY

WEEK 5+: Phase 2 (When Needed)
├─ Add Redis when SQL > 85% CPU
├─ Add Functions for async workloads
├─ Add API Management for rate limiting
└─ Scale horizontally with multiple App Service instances
    Status: ✅ SCALING
```

---

## 🔄 Data Flow Diagram

```
                            ┌──────────────────┐
                            │   Users (PWA)    │
                            └────────┬─────────┘
                                     │
                         ┌───────────┼───────────┐
                         │           │           │
                         ▼           ▼           ▼
                    ┌────────┐  ┌────────┐  ┌────────┐
                    │ Browse │  │ Quiz   │  │ Cart   │
                    └────┬───┘  └───┬────┘  └───┬────┘
                         │          │          │
                ┌────────┴──────────┴──────────┘
                │
    ┌───────────▼────────────┐
    │ Static Web Apps (CDN)  │  ◄─── Serves PWA
    └───────────┬────────────┘
                │
    ┌───────────▼────────────────────────┐
    │  App Service API Gateway           │
    │  (Node.js/Express)                 │
    └─┬───────┬────────┬────────┬────────┘
      │       │        │        │
      │   ┌───▼───┐┌───▼──┐┌───▼───┐
      │   │SQL DB ││ Redis ││ Storage│
      │   └───────┘└──────┘└────────┘
      │
      ▼
  ┌─────────────────┐
  │ Key Vault       │  ◄─── Secrets
  │ (Credentials)   │
  └─────────────────┘

Monitoring Stack:
  └─► Application Insights + Azure Monitor
      (Continuous telemetry & alerts)
```

---

## ✅ Phase 1 Checklist

- [ ] Docker containerize backend & frontend
- [ ] Create Azure SQL Database
- [ ] Migrate mock data to SQL
- [ ] Deploy backend to App Service
- [ ] Deploy frontend to Static Web Apps
- [ ] Setup GitHub Actions CI/CD
- [ ] Configure Entra ID authentication
- [ ] Setup Key Vault with secrets
- [ ] Enable Application Insights monitoring
- [ ] Create NSG rules
- [ ] Setup alerts in Monitor
- [ ] Test full journey end-to-end
- [ ] Performance testing (load test)
- [ ] Document runbooks & deployment guide
- [ ] Team training

---

## 🚀 Ready to Build?

Which component should we implement first?

1. **Docker Setup** - Containerize backend & frontend
2. **Azure SQL Database** - Setup schema & migrate data
3. **GitHub Actions** - Create CI/CD pipeline
4. **Entra ID Integration** - Add authentication
5. **Full Deployment** - Deploy all 8 Phase 1 services

Let me know! 🎯
