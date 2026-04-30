# GitHub Environment & Azure Setup Guide

## 1. GitHub Environments

Create three environments in **Settings → Environments**:

| Environment | Protection rules |
|-------------|-----------------|
| `dev`       | No approval required, auto-deploy on push to `main` |
| `staging`   | 1 required reviewer from `@your-org/devops-team` |
| `prod`      | 2 required reviewers from `@your-org/devops-team` + `@your-org/security-team`; 15-min wait timer |

### Secrets per environment

| Secret | Description |
|--------|-------------|
| `AZURE_CLIENT_ID` | Managed identity / service principal client ID |
| `AZURE_TENANT_ID` | Azure AD tenant ID (shared across envs) |
| `AZURE_SUBSCRIPTION_ID` | Target subscription |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_<ENV>` | SWA deployment token |
| `AZURE_DEVOPS_TOKEN` | Azure Boards PAT for work-item linking |

## 2. Azure OIDC Federated Identity (no client secrets)

```bash
# Create a service principal for each environment
az ad app create --display-name "healthsupp-github-dev"
APP_ID=$(az ad app list --display-name "healthsupp-github-dev" --query '[0].appId' -o tsv)

# Add federated credential (OIDC — no client secret needed)
az ad app federated-credential create --id $APP_ID --parameters '{
  "name": "github-deploy",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:YOUR_ORG/SampleWebsite:environment:dev",
  "audiences": ["api://AzureADTokenExchange"]
}'

# Create service principal and assign Contributor on the resource group
az ad sp create --id $APP_ID
SP_ID=$(az ad sp show --id $APP_ID --query id -o tsv)
az role assignment create \
  --assignee $SP_ID \
  --role Contributor \
  --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/healthsupp-dev-rg
```

Repeat for `staging` and `prod` environments, using their respective resource groups.

## 3. Deploy infrastructure

```bash
# Create resource groups
az group create --name healthsupp-dev-rg --location australiaeast
az group create --name healthsupp-staging-rg --location australiaeast
az group create --name healthsupp-prod-rg --location australiaeast

# Deploy (dry-run first)
az deployment group what-if \
  --resource-group healthsupp-dev-rg \
  --template-file infra/main.bicep \
  --parameters infra/parameters/dev.parameters.json

# Deploy for real
az deployment group create \
  --resource-group healthsupp-dev-rg \
  --template-file infra/main.bicep \
  --parameters infra/parameters/dev.parameters.json
```

## 4. Post-deployment: set real Key Vault secrets

```bash
KV_NAME="healthsuppdevkv"   # adjust per environment

az keyvault secret set \
  --vault-name $KV_NAME \
  --name SqlConnectionString \
  --value "Server=healthsupp-dev-sql.database.windows.net;Database=healthsupp-dev-db;..."

az keyvault secret set \
  --vault-name $KV_NAME \
  --name StorageConnectionString \
  --value "DefaultEndpointsProtocol=https;AccountName=..."
```

## 5. Apply Azure Policies

```bash
# Assign policies at resource group scope
az policy definition create \
  --name "require-https-appservice" \
  --rules infra/policies/require-https.json \
  --mode All

az policy assignment create \
  --name "require-https" \
  --policy "require-https-appservice" \
  --resource-group healthsupp-prod-rg

az policy definition create \
  --name "allowed-locations" \
  --rules infra/policies/allowed-locations.json \
  --mode All

az policy assignment create \
  --name "allowed-locations" \
  --policy "allowed-locations" \
  --resource-group healthsupp-prod-rg
```

## 6. Branch protection (GitHub)

In **Settings → Branches → Add rule** for `main`:

- [x] Require a pull request before merging
- [x] Require 1 approving review
- [x] Dismiss stale reviews on new commits
- [x] Require review from Code Owners
- [x] Require status checks: `build`, `codeql`, `npm-audit`
- [x] Require branches to be up to date
- [x] Restrict who can push to matching branches → `@your-org/devops-team`
