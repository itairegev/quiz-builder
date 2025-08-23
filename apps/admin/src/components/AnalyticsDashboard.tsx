'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Text,
  Button,
  Tabs,
  Badge,
  DataTable,
  ProgressBar,
  Stack,
  Layout
} from '@shopify/polaris';

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'overview', content: 'Overview' },
    { id: 'performance', content: 'Performance' },
    { id: 'engagement', content: 'Engagement' },
    { id: 'reports', content: 'Reports' },
  ];

  // Mock analytics data (will be replaced with real API calls)
  const [analyticsData, setAnalyticsData] = useState({
    totalQuizzes: 24,
    totalSubmissions: 1247,
    averageCompletionRate: 78.5,
    averageTimeToComplete: 4.2,
    topPerformingQuiz: 'Product Knowledge Test',
    recentActivity: [
      { quiz: 'Brand Awareness Quiz', submissions: 45, completionRate: 82.3, date: '2025-08-23' },
      { quiz: 'Customer Satisfaction', submissions: 38, completionRate: 76.1, date: '2025-08-22' },
      { quiz: 'Product Knowledge Test', submissions: 52, completionRate: 89.7, date: '2025-08-21' },
    ]
  });

  // Time range options
  const timeRangeOptions = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'This year', value: '1y' },
  ];

  // Load analytics data
  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      // const data = await response.json();
      // setAnalyticsData(data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Analytics data loaded for time range:', timeRange);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts or time range changes
  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Format percentage
  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  // Format time in minutes
  const formatTime = (minutes: number) => {
    return `${minutes.toFixed(1)} min`;
  };

  return (
    <Card>
      <div style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              📊
            </div>
            <div>
              <Text variant="headingMd" as="h3">
                Analytics Dashboard
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                Track quiz performance and user engagement
              </Text>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #c9cccf',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Button 
              onClick={loadAnalyticsData}
              loading={isLoading}
              disabled={isLoading}
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} selected={activeTab} onSelect={setActiveTab}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Text variant="headingMd" as="h4">
                  Key Metrics
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Overview of quiz performance and engagement
                </Text>
              </div>

              {/* Metrics Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {/* Total Quizzes */}
                <Card>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        📝
                      </div>
                      <Text variant="headingSm" as="h5">Total Quizzes</Text>
                    </div>
                    <Text variant="headingLg" as="h2" style={{ color: '#3b82f6' }}>
                      {formatNumber(analyticsData.totalQuizzes)}
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Active quizzes in the system
                    </Text>
                  </div>
                </Card>

                {/* Total Submissions */}
                <Card>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        👥
                      </div>
                      <Text variant="headingSm" as="h5">Total Submissions</Text>
                    </div>
                    <Text variant="headingLg" as="h2" style={{ color: '#10b981' }}>
                      {formatNumber(analyticsData.totalSubmissions)}
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Quiz attempts this period
                    </Text>
                  </div>
                </Card>

                {/* Completion Rate */}
                <Card>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#f59e0b',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        📈
                      </div>
                      <Text variant="headingSm" as="h5">Completion Rate</Text>
                    </div>
                    <Text variant="headingLg" as="h2" style={{ color: '#f59e0b' }}>
                      {formatPercentage(analyticsData.averageCompletionRate)}
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Average quiz completion rate
                    </Text>
                  </div>
                </Card>

                {/* Average Time */}
                <Card>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#8b5cf6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        ⏱️
                      </div>
                      <Text variant="headingSm" as="h5">Avg. Time</Text>
                    </div>
                    <Text variant="headingLg" as="h2" style={{ color: '#8b5cf6' }}>
                      {formatTime(analyticsData.averageTimeToComplete)}
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Time to complete quizzes
                    </Text>
                  </div>
                </Card>
              </div>

              {/* Top Performing Quiz */}
              <div style={{ marginBottom: '1.5rem' }}>
                <Text variant="headingMd" as="h4" style={{ marginBottom: '1rem' }}>
                  Top Performing Quiz
                </Text>
                <Card>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <Text variant="headingSm" as="h5">
                          {analyticsData.topPerformingQuiz}
                        </Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          Highest completion rate and engagement
                        </Text>
                      </div>
                      <Badge tone="success">Top Performer</Badge>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Activity */}
              <div>
                <Text variant="headingMd" as="h4" style={{ marginBottom: '1rem' }}>
                  Recent Activity
                </Text>
                <Card>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {analyticsData.recentActivity.map((activity, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '0.5rem 0',
                          borderBottom: index < analyticsData.recentActivity.length - 1 ? '1px solid #e5e7eb' : 'none'
                        }}>
                          <div>
                            <Text variant="bodyMd" as="p" fontWeight="semibold">
                              {activity.quiz}
                            </Text>
                            <Text variant="bodySm" as="p" tone="subdued">
                              {activity.date} • {activity.submissions} submissions
                            </Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Text variant="bodyMd" as="p">
                              {formatPercentage(activity.completionRate)}
                            </Text>
                            <ProgressBar 
                              progress={activity.completionRate / 100} 
                              size="small"
                              color="success"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 1 && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Text variant="headingMd" as="h4">
                  Performance Analytics
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Detailed performance metrics and trends
                </Text>
              </div>

              <div style={{ padding: '1rem' }}>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Performance analytics will include:
                </Text>
                <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                  <li>Quiz completion rates over time</li>
                  <li>Performance by quiz category</li>
                  <li>User score distributions</li>
                  <li>Time-based performance trends</li>
                  <li>Comparative analysis between quizzes</li>
                </ul>
              </div>
            </div>
          )}

          {/* Engagement Tab */}
          {activeTab === 2 && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Text variant="headingMd" as="h4">
                  User Engagement
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Track user behavior and engagement patterns
                </Text>
              </div>

              <div style={{ padding: '1rem' }}>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Engagement analytics will include:
                </Text>
                <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                  <li>User session duration</li>
                  <li>Quiz abandonment rates</li>
                  <li>Return user frequency</li>
                  <li>Device and platform usage</li>
                  <li>Geographic engagement patterns</li>
                </ul>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 3 && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Text variant="headingMd" as="h4">
                  Reports & Export
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Generate and export detailed reports
                </Text>
              </div>

              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Button size="large">
                    Generate Performance Report
                  </Button>
                  <Button size="large">
                    Export Engagement Data
                  </Button>
                  <Button size="large">
                    Download Analytics CSV
                  </Button>
                  <Button size="large">
                    Schedule Weekly Reports
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </Card>
  );
}
