'use client';

import { useState, useEffect } from 'react';
import { Card, Text, Stack, Badge, Button, DataTable, Spinner } from '@shopify/polaris';

interface MetricData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp?: string;
}

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  details?: any;
  lastChecked: string;
}

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: Record<string, HealthCheck>;
  timestamp: string;
  uptime: number;
  version: string;
}

export default function MonitoringDashboard() {
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Fetch health data
      const healthResponse = await fetch('/api/v1/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealthData(healthData.data);
      }

      // Fetch metrics
      const metricsResponse = await fetch('/api/v1/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.data);
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch monitoring data');
      console.error('Monitoring data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'critical';
      default:
        return 'info';
    }
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <Card>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Spinner size="large" />
          <Text variant="bodyMd" as="p" style={{ marginTop: '1rem' }}>
            Loading monitoring data...
          </Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ padding: '1.5rem' }}>
          <Text variant="headingMd" as="h3" color="critical">
            Monitoring Error
          </Text>
          <Text variant="bodyMd" as="p" color="subdued">
            {error}
          </Text>
          <Button onClick={fetchMonitoringData} style={{ marginTop: '1rem' }}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Stack vertical spacing="loose">
      {/* Overall Health Status */}
      {healthData && (
        <Card>
          <div style={{ padding: '1.5rem' }}>
            <Stack vertical spacing="tight">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Text variant="headingMd" as="h3">
                  System Health
                </Text>
                <Badge status={getStatusColor(healthData.status)}>
                  {healthData.status.toUpperCase()}
                </Badge>
              </div>
              
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <div>
                  <Text variant="bodySm" as="p" color="subdued">
                    Uptime
                  </Text>
                  <Text variant="headingMd" as="p">
                    {formatUptime(healthData.uptime)}
                  </Text>
                </div>
                <div>
                  <Text variant="bodySm" as="p" color="subdued">
                    Version
                  </Text>
                  <Text variant="headingMd" as="p">
                    {healthData.version}
                  </Text>
                </div>
                <div>
                  <Text variant="bodySm" as="p" color="subdued">
                    Last Updated
                  </Text>
                  <Text variant="headingMd" as="p">
                    {new Date(healthData.timestamp).toLocaleString()}
                  </Text>
                </div>
              </div>
            </Stack>
          </div>
        </Card>
      )}

      {/* Health Checks */}
      {healthData && (
        <Card>
          <div style={{ padding: '1.5rem' }}>
            <Text variant="headingMd" as="h3" style={{ marginBottom: '1rem' }}>
              Service Health Checks
            </Text>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {Object.entries(healthData.checks).map(([name, check]) => (
                <div key={name} style={{ padding: '1rem', border: '1px solid #e1e3e5', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Text variant="bodyMd" as="p" fontWeight="bold">
                      {name.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <Badge status={getStatusColor(check.status)}>
                      {check.status}
                    </Badge>
                  </div>
                  
                  {check.message && (
                    <Text variant="bodySm" as="p" color="subdued">
                      {check.message}
                    </Text>
                  )}
                  
                  <Text variant="bodySm" as="p" color="subdued" style={{ marginTop: '0.5rem' }}>
                    Last checked: {new Date(check.lastChecked).toLocaleTimeString()}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      {Object.keys(metrics).length > 0 && (
        <Card>
          <div style={{ padding: '1.5rem' }}>
            <Text variant="headingMd" as="h3" style={{ marginBottom: '1rem' }}>
              Key Metrics
            </Text>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {Object.entries(metrics).map(([name, data]) => (
                <div key={name} style={{ padding: '1rem', border: '1px solid #e1e3e5', borderRadius: '8px' }}>
                  <Text variant="bodySm" as="p" color="subdued">
                    {name.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  
                  <Text variant="headingMd" as="p">
                    {typeof data.latest === 'number' ? data.latest.toFixed(2) : data.latest}
                  </Text>
                  
                  {data.unit && (
                    <Text variant="bodySm" as="p" color="subdued">
                      {data.unit}
                    </Text>
                  )}
                  
                  {data.avg && (
                    <Text variant="bodySm" as="p" color="subdued">
                      Avg: {data.avg.toFixed(2)}
                    </Text>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Refresh Button */}
      <div style={{ textAlign: 'center' }}>
        <Button onClick={fetchMonitoringData}>
          Refresh Data
        </Button>
      </div>
    </Stack>
  );
}

