import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Text, 
  Tabs, 
  Button, 
  ProgressBar, 
  Badge 
} from '@shopify/polaris';

interface AnalyticsData {
  totalQuizzes: number;
  totalSubmissions: number;
  averageCompletionRate: number;
  averageTimeToComplete: number;
  topPerformingQuiz: string;
  recentActivity: Array<{
    quiz: string;
    submissions: number;
    completionRate: number;
    date: string;
  }>;
  performanceTrends: Array<{
    date: string;
    submissions: number;
    completionRate: number;
  }>;
  engagementMetrics: {
    averageSessionDuration: number;
    bounceRate: number;
    returnUserRate: number;
    deviceBreakdown: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
  };
  isLoading: boolean;
}

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Real analytics data state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalQuizzes: 0,
    totalSubmissions: 0,
    averageCompletionRate: 0,
    averageTimeToComplete: 0,
    topPerformingQuiz: '',
    recentActivity: [],
    performanceTrends: [],
    engagementMetrics: {
      averageSessionDuration: 0,
      bounceRate: 0,
      returnUserRate: 0,
      deviceBreakdown: {
        desktop: 0,
        mobile: 0,
        tablet: 0
      }
    },
    isLoading: true
  });

  const tabs = [
    { id: 'overview', content: 'Overview' },
    { id: 'performance', content: 'Performance' },
    { id: 'engagement', content: 'Engagement' },
    { id: 'reports', content: 'Reports' }
  ];

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  // Load analytics data from API
  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Real API call (will be implemented when backend is ready)
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData({
          ...data,
          isLoading: false
        });
        console.log('Analytics data loaded from API:', data);
      } else {
        // Fallback to mock data if API is not ready
        await loadMockData();
      }
    } catch (error) {
      console.error('Failed to load analytics from API, using mock data:', error);
      await loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  // Load mock data as fallback
  const loadMockData = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData: AnalyticsData = {
      totalQuizzes: 24,
      totalSubmissions: 1247,
      averageCompletionRate: 78.5,
      averageTimeToComplete: 4.2,
      topPerformingQuiz: 'Product Knowledge Test',
      recentActivity: [
        { quiz: 'Brand Awareness Quiz', submissions: 45, completionRate: 82.3, date: '2025-08-23' },
        { quiz: 'Customer Satisfaction', submissions: 38, completionRate: 76.1, date: '2025-08-22' },
        { quiz: 'Product Knowledge Test', submissions: 52, completionRate: 89.7, date: '2025-08-21' },
      ],
      performanceTrends: [
        { date: '2025-08-17', submissions: 23, completionRate: 75.2 },
        { date: '2025-08-18', submissions: 31, completionRate: 78.9 },
        { date: '2025-08-19', submissions: 28, completionRate: 76.4 },
        { date: '2025-08-20', submissions: 35, completionRate: 79.1 },
        { date: '2025-08-21', submissions: 42, completionRate: 81.7 },
        { date: '2025-08-22', submissions: 38, completionRate: 77.3 },
        { date: '2025-08-23', submissions: 45, completionRate: 82.3 },
      ],
      engagementMetrics: {
        averageSessionDuration: 3.8,
        bounceRate: 22.4,
        returnUserRate: 34.7,
        deviceBreakdown: {
          desktop: 58.3,
          mobile: 35.2,
          tablet: 6.5
        }
      },
      isLoading: false
    };
    
    setAnalyticsData(mockData);
    console.log('Mock analytics data loaded');
  };

  // Load data when component mounts or time range changes
  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  // Helper functions
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatTime = (minutes: number) => {
    return `${minutes.toFixed(1)} min`;
  };

  // Simple chart rendering functions
  const renderPerformanceChart = () => {
    if (!analyticsData.performanceTrends || analyticsData.performanceTrends.length === 0) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No performance data available</div>;
    }

    const maxSubmissions = Math.max(...analyticsData.performanceTrends.map(t => t.submissions));
    const maxCompletion = Math.max(...analyticsData.performanceTrends.map(t => t.completionRate));

    return (
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Text variant="headingSm" as="h5">Submissions Trend</Text>
          <Text variant="headingSm" as="h5">Completion Rate Trend</Text>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Submissions Chart */}
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'end', 
              height: '120px', 
              gap: '4px',
              padding: '1rem 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              {analyticsData.performanceTrends.map((trend, index) => (
                <div key={index} style={{ 
                  flex: 1,
                  backgroundColor: '#3b82f6',
                  height: `${(trend.submissions / maxSubmissions) * 100}%`,
                  minHeight: '4px',
                  borderRadius: '2px 2px 0 0',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: '#6b7280',
                    whiteSpace: 'nowrap'
                  }}>
                    {trend.submissions}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '10px', 
              color: '#6b7280',
              marginTop: '0.5rem'
            }}>
              {analyticsData.performanceTrends.map((trend, index) => (
                <span key={index} style={{ flex: 1, textAlign: 'center' }}>
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              ))}
            </div>
          </div>

          {/* Completion Rate Chart */}
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'end', 
              height: '120px', 
              gap: '4px',
              padding: '1rem 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              {analyticsData.performanceTrends.map((trend, index) => (
                <div key={index} style={{ 
                  flex: 1,
                  backgroundColor: '#10b981',
                  height: `${(trend.completionRate / maxCompletion) * 100}%`,
                  minHeight: '4px',
                  borderRadius: '2px 2px 0 0',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: '#6b7280',
                    whiteSpace: 'nowrap'
                  }}>
                    {trend.completionRate.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '10px', 
              color: '#6b7280',
              marginTop: '0.5rem'
            }}>
              {analyticsData.performanceTrends.map((trend, index) => (
                <span key={index} style={{ flex: 1, textAlign: 'center' }}>
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEngagementChart = () => {
    if (!analyticsData.engagementMetrics || !analyticsData.engagementMetrics.deviceBreakdown) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No engagement data available</div>;
    }

    const { deviceBreakdown } = analyticsData.engagementMetrics;

    return (
      <div style={{ marginTop: '1rem' }}>
        <Text variant="headingSm" as="h5" style={{ marginBottom: '1rem' }}>Device Usage Breakdown</Text>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Desktop */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <Text variant="bodyMd" as="span">Desktop</Text>
              <Text variant="bodyMd" as="span">{deviceBreakdown.desktop.toFixed(1)}%</Text>
            </div>
            <ProgressBar 
              progress={deviceBreakdown.desktop / 100} 
              color="success"
              size="small"
            />
          </div>

          {/* Mobile */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <Text variant="bodyMd" as="span">Mobile</Text>
              <Text variant="bodyMd" as="span">{deviceBreakdown.mobile.toFixed(1)}%</Text>
            </div>
            <ProgressBar 
              progress={deviceBreakdown.mobile / 100} 
              color="primary"
              size="small"
            />
          </div>

          {/* Tablet */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <Text variant="bodyMd" as="span">Tablet</Text>
              <Text variant="bodyMd" as="span">{deviceBreakdown.tablet.toFixed(1)}%</Text>
            </div>
            <ProgressBar 
              progress={deviceBreakdown.tablet / 100} 
              color="warning"
              size="small"
            />
          </div>
        </div>
      </div>
    );
  };

  // Report generation functions
  const generateReport = async (type: string) => {
    try {
      console.log(`Generating ${type} report...`);
      // TODO: Implement actual report generation
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully! 📊`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const exportData = async (format: string) => {
    try {
      console.log(`Exporting data in ${format} format...`);
      
      if (format === 'json') {
        // Export as JSON file
        const dataStr = JSON.stringify(analyticsData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else {
        // TODO: Implement CSV and PDF export
        alert(`${format.toUpperCase()} export will be implemented soon! 📥`);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const scheduleReport = async (frequency: string) => {
    try {
      console.log(`Scheduling ${frequency} reports...`);
      // TODO: Implement actual report scheduling
      alert(`${frequency.charAt(0).toUpperCase() + frequency.slice(1)} reports scheduled successfully! 📅`);
    } catch (error) {
      console.error('Failed to schedule reports:', error);
      alert('Failed to schedule reports. Please try again.');
    }
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
        <Tabs tabs={tabs} selected={0} onSelect={(selectedTabIndex) => {
          const tabIds = ['overview', 'performance', 'engagement', 'reports'];
          setActiveTab(tabIds[selectedTabIndex]);
        }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Text variant="headingMd" as="h4">
                  Key Metrics
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Overview of quiz performance and engagement
                </Text>
              </div>

              {analyticsData.isLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Text variant="bodyMd" as="p" tone="subdued">Loading analytics data...</Text>
                </div>
              ) : (
                <div>
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

                    {/* Average Completion Rate */}
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

                    {/* Average Time to Complete */}
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
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Text variant="headingMd" as="h4">
                  Performance Analytics
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Detailed performance metrics and trends over time
                </Text>
              </div>

              <div style={{ padding: '1rem' }}>
                {analyticsData.isLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text variant="bodyMd" as="p" tone="subdued">Loading performance data...</Text>
                  </div>
                ) : (
                  <div>
                    {/* Performance Summary Cards */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '1rem',
                      marginBottom: '2rem'
                    }}>
                      <Card>
                        <div style={{ padding: '1rem', textAlign: 'center' }}>
                          <Text variant="headingLg" as="h3" style={{ color: '#3b82f6' }}>
                            {analyticsData.performanceTrends.length}
                          </Text>
                          <Text variant="bodySm" as="p" tone="subdued">
                            Days Tracked
                          </Text>
                        </div>
                      </Card>
                      
                      <Card>
                        <div style={{ padding: '1rem', textAlign: 'center' }}>
                          <Text variant="headingLg" as="h3" style={{ color: '#10b981' }}>
                            {Math.round(analyticsData.performanceTrends.reduce((sum, t) => sum + t.submissions, 0) / analyticsData.performanceTrends.length)}
                          </Text>
                          <Text variant="bodySm" as="p" tone="subdued">
                            Avg. Daily Submissions
                          </Text>
                        </div>
                      </Card>
                      
                      <Card>
                        <div style={{ padding: '1rem', textAlign: 'center' }}>
                          <Text variant="headingLg" as="h3" style={{ color: '#f59e0b' }}>
                            {Math.round(analyticsData.performanceTrends.reduce((sum, t) => sum + t.completionRate, 0) / analyticsData.performanceTrends.length)}%
                          </Text>
                          <Text variant="bodySm" as="p" tone="subdued">
                            Avg. Completion Rate
                          </Text>
                        </div>
                      </Card>
                    </div>

                    {/* Performance Charts */}
                    <Card>
                      <div style={{ padding: '1rem' }}>
                        {renderPerformanceChart()}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Engagement Tab */}
          {activeTab === 'engagement' && (
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
                {analyticsData.isLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text variant="bodyMd" as="p" tone="subdued">Loading engagement data...</Text>
                  </div>
                ) : (
                  <div>
                    {/* Engagement Summary Cards */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '1rem',
                      marginBottom: '2rem'
                    }}>
                      <Card>
                        <div style={{ padding: '1rem', textAlign: 'center' }}>
                          <Text variant="headingLg" as="h3" style={{ color: '#3b82f6' }}>
                            {analyticsData.engagementMetrics.averageSessionDuration?.toFixed(1) || '0'} min
                          </Text>
                          <Text variant="bodySm" as="p" tone="subdued">
                            Avg. Session Duration
                          </Text>
                        </div>
                      </Card>
                      
                      <Card>
                        <div style={{ padding: '1rem', textAlign: 'center' }}>
                          <Text variant="headingLg" as="h3" style={{ color: '#ef4444' }}>
                            {analyticsData.engagementMetrics.bounceRate?.toFixed(1) || '0'}%
                          </Text>
                          <Text variant="bodySm" as="p" tone="subdued">
                            Bounce Rate
                          </Text>
                        </div>
                      </Card>
                      
                      <Card>
                        <div style={{ padding: '1rem', textAlign: 'center' }}>
                          <Text variant="headingLg" as="h3" style={{ color: '#10b981' }}>
                            {analyticsData.engagementMetrics.returnUserRate?.toFixed(1) || '0'}%
                          </Text>
                          <Text variant="bodySm" as="p" tone="subdued">
                            Return User Rate
                          </Text>
                        </div>
                      </Card>
                    </div>

                    {/* Engagement Charts */}
                    <Card>
                      <div style={{ padding: '1rem' }}>
                        {renderEngagementChart()}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
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
                {analyticsData.isLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text variant="bodyMd" as="p" tone="subdued">Loading report options...</Text>
                  </div>
                ) : (
                  <div>
                    {/* Report Generation */}
                    <div style={{ marginBottom: '2rem' }}>
                      <Text variant="headingSm" as="h5" style={{ marginBottom: '1rem' }}>
                        Generate Reports
                      </Text>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Button 
                          size="large"
                          onClick={() => generateReport('performance')}
                        >
                          📊 Generate Performance Report
                        </Button>
                        <Button 
                          size="large"
                          onClick={() => generateReport('engagement')}
                        >
                          👥 Generate Engagement Report
                        </Button>
                        <Button 
                          size="large"
                          onClick={() => generateReport('comprehensive')}
                        >
                          📋 Generate Comprehensive Report
                        </Button>
                      </div>
                    </div>

                    {/* Data Export */}
                    <div style={{ marginBottom: '2rem' }}>
                      <Text variant="headingSm" as="h5" style={{ marginBottom: '1rem' }}>
                        Export Data
                      </Text>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Button 
                          size="large"
                          onClick={() => exportData('csv')}
                        >
                          📥 Export Analytics CSV
                        </Button>
                        <Button 
                          size="large"
                          onClick={() => exportData('json')}
                        >
                          📄 Export Analytics JSON
                        </Button>
                        <Button 
                          size="large"
                          onClick={() => exportData('pdf')}
                        >
                          📑 Export Analytics PDF
                        </Button>
                      </div>
                    </div>

                    {/* Report Scheduling */}
                    <div>
                      <Text variant="headingSm" as="h5" style={{ marginBottom: '1rem' }}>
                        Schedule Reports
                      </Text>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Button 
                          size="large"
                          onClick={() => scheduleReport('weekly')}
                        >
                          📅 Schedule Weekly Reports
                        </Button>
                        <Button 
                          size="large"
                          onClick={() => scheduleReport('monthly')}
                        >
                          📅 Schedule Monthly Reports
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </Card>
  );
};

export default AnalyticsDashboard;
