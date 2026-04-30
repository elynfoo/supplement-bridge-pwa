param resourcePrefix string
param location string
param tags object
param sqlAdminLogin string
@secure()
param sqlAdminPassword string
param environmentName string
param logAnalyticsWorkspaceId string

var sqlServerName = '${resourcePrefix}-sql'
var databaseName = '${resourcePrefix}-db'

// ─── Azure SQL Server ────────────────────────────────────────────────────────
resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: sqlServerName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// ─── Firewall: allow Azure services ─────────────────────────────────────────
resource firewallAllowAzure 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ─── SQL Database ────────────────────────────────────────────────────────────
resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: databaseName
  location: location
  tags: tags
  sku: {
    name: environmentName == 'prod' ? 'S2' : 'S0'
    tier: 'Standard'
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: environmentName == 'prod' ? 10737418240 : 2147483648  // 10 GB prod / 2 GB dev
    readScale: 'Disabled'
    zoneRedundant: false
    requestedBackupStorageRedundancy: environmentName == 'prod' ? 'Geo' : 'Local'
  }
}

// ─── Diagnostic settings → Log Analytics ───────────────────────────────────
resource sqlDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'sql-diagnostics'
  scope: sqlDatabase
  properties: {
    workspaceId: logAnalyticsWorkspaceId
    logs: [
      {
        categoryGroup: 'audit'
        enabled: true
      }
      {
        categoryGroup: 'allLogs'
        enabled: environmentName == 'prod'
      }
    ]
    metrics: [
      {
        category: 'Basic'
        enabled: true
      }
    ]
  }
}

// ─── Auditing → Log Analytics ───────────────────────────────────────────────
resource sqlAuditingPolicy 'Microsoft.Sql/servers/auditingPolicies@2014-04-01' = {
  parent: sqlServer
  name: 'Default'
  properties: {
    auditingState: 'Enabled'
  }
}

// ─── Outputs ────────────────────────────────────────────────────────────────
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output sqlServerId string = sqlServer.id
output databaseName string = sqlDatabase.name
