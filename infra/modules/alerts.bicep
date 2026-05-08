param resourcePrefix string
param location string
param tags object
param alertEmail string
param appServicePlanId string
param appServiceId string
param logAnalyticsWorkspaceId string

var actionGroupName = '${resourcePrefix}-ag'

// ─── Action Group (free) ─────────────────────────────────────────────────────
resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: actionGroupName
  location: 'global'
  tags: tags
  properties: {
    groupShortName: 'OpsAlert'
    enabled: true
    emailReceivers: [
      {
        name: 'PrimaryOps'
        emailAddress: alertEmail
        useCommonAlertSchema: true
      }
    ]
  }
}

// ─── Alert: High CPU (free — counts toward 10 free metric alerts) ─────────────
resource alertHighCpu 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${resourcePrefix}-alert-high-cpu'
  location: 'global'
  tags: tags
  properties: {
    description: 'App Service Plan CPU > 85% for 5 minutes'
    severity: 2
    enabled: true
    scopes: [appServicePlanId]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighCPU'
          criterionType: 'StaticThresholdCriterion'
          metricName: 'CpuPercentage'
          operator: 'GreaterThan'
          threshold: 85
          timeAggregation: 'Average'
        }
      ]
    }
    actions: [{ actionGroupId: actionGroup.id }]
  }
}

// ─── Alert: HTTP 5xx errors (free) ───────────────────────────────────────────
resource alertHttp5xx 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${resourcePrefix}-alert-http5xx'
  location: 'global'
  tags: tags
  properties: {
    description: 'App Service HTTP 5xx count > 10 in 5 minutes'
    severity: 1
    enabled: true
    scopes: [appServiceId]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'Http5xxErrors'
          criterionType: 'StaticThresholdCriterion'
          metricName: 'Http5xx'
          operator: 'GreaterThan'
          threshold: 10
          timeAggregation: 'Total'
        }
      ]
    }
    actions: [{ actionGroupId: actionGroup.id }]
  }
}

// ─── Alert: Response time (free) ─────────────────────────────────────────────
resource alertResponseTime 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${resourcePrefix}-alert-response-time'
  location: 'global'
  tags: tags
  properties: {
    description: 'App Service average response time > 3 seconds'
    severity: 2
    enabled: true
    scopes: [appServiceId]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'SlowResponse'
          criterionType: 'StaticThresholdCriterion'
          metricName: 'AverageResponseTime'
          operator: 'GreaterThan'
          threshold: 3
          timeAggregation: 'Average'
        }
      ]
    }
    actions: [{ actionGroupId: actionGroup.id }]
  }
}

// ─── Alert: App exceptions via Log Analytics (free) ──────────────────────────
resource alertAppExceptions 'Microsoft.Insights/scheduledQueryRules@2023-03-15-preview' = {
  name: '${resourcePrefix}-alert-exceptions'
  location: location
  tags: tags
  properties: {
    description: 'Unhandled exceptions detected in Application Insights'
    severity: 1
    enabled: true
    scopes: [logAnalyticsWorkspaceId]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      allOf: [
        {
          query: 'exceptions | where severityLevel >= 3 | summarize count() by bin(timestamp, 5m)'
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 5
          failingPeriods: {
            numberOfEvaluationPeriods: 1
            minFailingPeriodsToAlert: 1
          }
        }
      ]
    }
    actions: {
      actionGroups: [actionGroup.id]
    }
  }
}

output actionGroupId string = actionGroup.id
