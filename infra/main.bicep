targetScope = 'resourceGroup'

@description('Environment name: dev, staging, or prod')
@allowed(['dev', 'staging', 'prod'])
param environmentName string

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Project/app name prefix')
param projectName string = 'healthsupp'

@description('SQL administrator login')
param sqlAdminLogin string

@secure()
@description('SQL administrator password')
param sqlAdminPassword string

@description('Alert notification email')
param alertEmail string

var resourcePrefix = '${projectName}-${environmentName}'
var tags = {
  Environment: environmentName
  Project: projectName
  ManagedBy: 'Bicep'
}

// Log Analytics + Application Insights
module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoring'
  params: {
    resourcePrefix: resourcePrefix
    location: location
    tags: tags
    alertEmail: alertEmail
    environmentName: environmentName
  }
}

// Key Vault
module keyVault 'modules/key-vault.bicep' = {
  name: 'key-vault'
  params: {
    resourcePrefix: resourcePrefix
    location: location
    tags: tags
    environmentName: environmentName
  }
}

// Storage Account
module storage 'modules/storage-account.bicep' = {
  name: 'storage-account'
  params: {
    resourcePrefix: resourcePrefix
    location: location
    tags: tags
    environmentName: environmentName
  }
}

// SQL Database
module sql 'modules/sql-database.bicep' = {
  name: 'sql-database'
  params: {
    resourcePrefix: resourcePrefix
    location: location
    tags: tags
    sqlAdminLogin: sqlAdminLogin
    sqlAdminPassword: sqlAdminPassword
    environmentName: environmentName
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
  }
}

// App Service (depends on Key Vault and monitoring)
module appService 'modules/app-service.bicep' = {
  name: 'app-service'
  params: {
    resourcePrefix: resourcePrefix
    location: location
    tags: tags
    environmentName: environmentName
    keyVaultName: keyVault.outputs.keyVaultName
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
    appInsightsInstrumentationKey: monitoring.outputs.appInsightsInstrumentationKey
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
  }
}

// Alerts (depends on all resources)
module alerts 'modules/alerts.bicep' = {
  name: 'alerts'
  params: {
    resourcePrefix: resourcePrefix
    location: location
    tags: tags
    alertEmail: alertEmail
    appServicePlanId: appService.outputs.appServicePlanId
    appServiceId: appService.outputs.appServiceId
    sqlServerId: sql.outputs.sqlServerId
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
  }
}

// Grant App Service managed identity access to Key Vault
module keyVaultAccess 'modules/key-vault.bicep' = {
  name: 'key-vault-access'
  params: {
    resourcePrefix: resourcePrefix
    location: location
    tags: tags
    environmentName: environmentName
    appServicePrincipalId: appService.outputs.appServicePrincipalId
  }
}

// ─── Outputs ───────────────────────────────────────────────────────────────
output appServiceUrl string = appService.outputs.appServiceUrl
output keyVaultUri string = keyVault.outputs.keyVaultUri
output storageAccountName string = storage.outputs.storageAccountName
output sqlServerFqdn string = sql.outputs.sqlServerFqdn
output appInsightsName string = monitoring.outputs.appInsightsName
output logAnalyticsWorkspaceName string = monitoring.outputs.logAnalyticsWorkspaceName
