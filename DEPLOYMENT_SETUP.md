# Azure Deployment Setup Guide

## Overview
This project uses GitHub Actions to automatically build, test, and deploy to Azure.

## Architecture
- **Frontend**: React PWA → Azure Static Web Apps
- **Backend**: Express API → Azure App Service
- **CI/CD**: GitHub Actions

## Prerequisites

### 1. Create Azure Resources

#### Frontend - Azure Static Web Apps
```bash
# Via Azure CLI
az staticwebapp create \
  --name supplement-bridge-pwa-frontend \
  --resource-group supplement-bridge-rg \
  --location eastus \
  --source https://github.com/elynfoo/supplement-bridge-pwa \
  --branch main \
  --app-location "frontend/build" \
  --output-location "."
```

#### Backend - Azure App Service
```bash
# Create App Service Plan
az appservice plan create \
  --name supplement-bridge-plan \
  --resource-group supplement-bridge-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group supplement-bridge-rg \
  --plan supplement-bridge-plan \
  --name supplement-bridge-api \
  --runtime "NODE|20-lts"
```

### 2. Get Deployment Credentials

#### For Static Web Apps
```bash
az staticwebapp secrets list \
  --name supplement-bridge-pwa-frontend \
  --query "properties.apiKey" \
  --output tsv
```

#### For App Service
```bash
az webapp deployment list-publishing-profiles \
  --resource-group supplement-bridge-rg \
  --name supplement-bridge-api \
  --xml
```

### 3. Add GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Create the following secrets:

| Secret Name | Value |
|------------|-------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Static Web Apps deployment token |
| `AZURE_APPSERVICE_NAME` | `supplement-bridge-api` |
| `AZURE_APPSERVICE_PUBLISH_PROFILE` | App Service publish profile (XML) |
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID |
| `AZURE_RESOURCE_GROUP` | `supplement-bridge-rg` |

### 4. Enable Workflows

1. Uncomment the deployment steps in `.github/workflows/deploy-azure.yml`
2. Update resource names to match your Azure resources
3. Push to `main` branch to trigger deployment

## Deployment Process

1. **Push to GitHub** → Triggers build and test
2. **All tests pass** → Deploys frontend to Static Web Apps
3. **Deploys backend** to App Service

## Monitoring

- GitHub Actions logs: Your repo → Actions tab
- Azure resources: Azure Portal or `az` CLI

## Next Steps

1. Create Azure resource group: `supplement-bridge-rg`
2. Follow the "Create Azure Resources" steps above
3. Add secrets to GitHub
4. Uncomment deployment steps in workflow files
5. Push to main to trigger first deployment
