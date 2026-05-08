param resourcePrefix string
param location string
param tags object
param environmentName string

var staticWebAppName = '${resourcePrefix}-frontend'

// ─── Static Web App ───────────────────────────────────────────────────────────
resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: staticWebAppName
  location: location
  tags: tags
  sku: {
    name: environmentName == 'prod' ? 'Standard' : 'Free'
    tier: environmentName == 'prod' ? 'Standard' : 'Free'
  }
  properties: {
    buildProperties: {
      appLocation: 'frontend'
      outputLocation: 'build'
    }
  }
}

// ─── Outputs ─────────────────────────────────────────────────────────────────
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output staticWebAppId string = staticWebApp.id
output deploymentToken string = listSecrets(staticWebApp.id, staticWebApp.apiVersion).properties.apiKey
