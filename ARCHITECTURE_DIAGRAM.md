```mermaid
graph TB
    subgraph Users["👥 USERS"]
        U["Users Access PWA"]
    end
    
    subgraph PHASE1["🟢 PHASE 1: PRODUCTION (Week 1-4) | Cost: $76-391/mo"]
        subgraph Ingress["PRESENTATION LAYER"]
            SWA["Azure Static Web Apps<br/>Frontend PWA<br/>$0-50/mo"]
        end
        
        subgraph Compute["APPLICATION LAYER"]
            ASP["Azure App Service<br/>Backend API<br/>Node.js/Express<br/>$55-200/mo"]
        end
        
        subgraph Data["DATA LAYER"]
            SQL["Azure SQL Database<br/>Orders, Products, Users<br/>$15-100/mo"]
            STG["Azure Storage<br/>Images, Logs, Backups<br/>$1-20/mo"]
        end
        
        subgraph Security["SECURITY & IDENTITY"]
            AAD["Azure Entra ID<br/>Authentication<br/>$0/mo"]
            KV["Azure Key Vault<br/>Secrets Management<br/>$0.50-1/mo"]
            NSG["Network Security<br/>Groups<br/>$0/mo"]
        end
        
        subgraph Monitoring["MONITORING & OBSERVABILITY"]
            AI["Application Insights<br/>Error Tracking & Performance<br/>$5-20/mo"]
            MON["Azure Monitor<br/>Infrastructure Metrics<br/>Included"]
        end
        
        subgraph DevOps["CI/CD & DEVOPS"]
            GHA["GitHub Actions<br/>Automated Build & Deploy<br/>$0/mo"]
        end
    end
    
    subgraph PHASE2["🟡 PHASE 2: SCALE (Week 5+) | Cost: +$65-150/mo"]
        subgraph Compute2["COMPUTE"]
            FUNC["Azure Functions<br/>Serverless Processing<br/>$0-50/mo"]
        end
        
        subgraph Data2["DATA"]
            RDS["Azure Cache Redis<br/>Performance Caching<br/>$15-50/mo"]
        end
        
        subgraph API2["API GATEWAY"]
            APIM["API Management<br/>Rate Limiting, Versioning<br/>$50/mo"]
        end
    end
    
    %% Phase 1 Flow
    U -->|Browse/Quiz/Cart| SWA
    SWA -->|HTTPS Requests| ASP
    ASP -->|Read/Write Data| SQL
    ASP -->|Upload Images| STG
    ASP -->|Verify Token| AAD
    ASP -->|Get Secrets| KV
    ASP -->|Logs & Metrics| AI
    SQL -->|Performance| MON
    STG -->|Performance| MON
    ASP -->|Auto Deploy| GHA
    GHA -->|Deploy to| SWA
    GHA -->|Deploy to| ASP
    
    %% Phase 2 Connections
    ASP -.->|Optional| FUNC
    SQL -.->|Speed up| RDS
    ASP -.->|Rate Limit| APIM
    
    %% Styling
    classDef phase1 fill:#d4edda,stroke:#28a745,stroke-width:2px
    classDef phase2 fill:#fff3cd,stroke:#ffc107,stroke-width:2px
    classDef user fill:#e7e7ff,stroke:#6c63ff,stroke-width:2px
    
    class PHASE1 phase1
    class PHASE2 phase2
    class Users user
    class U user
```

This Mermaid diagram can be:

1. **Rendered Online** → Copy to [mermaid.live](https://mermaid.live) → Export as PNG/JPEG
2. **Rendered in GitHub** → Push to GitHub repo, it displays as image
3. **Converted to Image** → Use tools like:
   - [Kroki.io](https://kroki.io) - Drag & drop
   - [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli) - Command line
   - VS Code extensions (Mermaid Preview)

---

## 🔄 Quick Way to Get JPEG

**Option 1: Online (Easiest)**
1. Go to https://mermaid.live
2. Paste the diagram code (from `ARCHITECTURE_DIAGRAM.md`)
3. Click Export → PNG/JPEG

**Option 2: VS Code Extension**
1. Install "Mermaid Preview" extension
2. Open file and preview
3. Right-click → Export as image

**Option 3: Command Line**
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i diagram.mmd -o diagram.png
```

---

Would you like me to:
1. ✅ Create more detailed Mermaid diagrams?
2. ✅ Generate PlantUML diagrams (alternative format)?
3. ✅ Create text descriptions you can use in draw.io or Lucidchart?

Let me know! 🎯
