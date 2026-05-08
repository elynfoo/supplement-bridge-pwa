targetScope = 'resourceGroup'

@description('Environment name: dev, staging, uat, or prod')
@allowed(['dev', 'staging', 'uat', 'prod'])
param environmentName string

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Project/app name prefix')
param projectName string = 'supplement-bridge'

@description('Alert notification email')
param alertEmail string = 'elynf@genstudents.org'

var resourcePrefix = '${projectName}-${environmentName}'
var tags = {
  Environment: environmentName
  Project: projectName
  ManagedBy: 'Bicep'
}

// Log Analytics + Application Insights (free 5GB/month)
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

// App Service (Free F1 plan)
module appService 'modules/app-service.bicep' = {
  name: 'app-service'
  params: {
    resourcePrefix: resourcePrefix
    location: location
    tags: tags
    environmentName: environmentName
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
    appInsightsInstrumentationKey: monitoring.outputs.appInsightsInstrumentationKey
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
  }
}

// Alerts (free — first 10 metric alerts per subscription are free)
module alerts 'modules/alerts.bicep' = {
  name: 'alerts'
  params: {
    resourcePrefix: resourcePrefix
    location: location
    tags: tags
    alertEmail: alertEmail
    appServicePlanId: appService.outputs.appServicePlanId
    appServiceId: appService.outputs.appServiceId
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
  }
}

// ─── Outputs ───────────────────────────────────────────────────────────────
output appServiceUrl string = appService.outputs.appServiceUrl
output appInsightsName string = monitoring.outputs.appInsightsName
output logAnalyticsWorkspaceName string = monitoring.outputs.logAnalyticsWorkspaceName
