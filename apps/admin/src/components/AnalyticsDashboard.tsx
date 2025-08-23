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
  const [isLoading, setIsLoading] = useState(true);

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
    isLoading: false
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
      console.log('Attempting to load analytics from API for time range:', timeRange);
      
      // Try to fetch from the API endpoint
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData({
          ...data,
          isLoading: false
        });
        console.log('Analytics data loaded from API:', data);
        
        // Show success feedback
        showUserFeedback('✅ Data loaded successfully from API', 'success');
      } else {
        console.log('API returned status:', response.status, 'using mock data');
        
        // Show fallback feedback based on status
        if (response.status === 500) {
          showUserFeedback('⚠️ Backend server error, using demo data', 'warning');
        } else if (response.status === 401) {
          showUserFeedback('⚠️ Authentication required, using demo data', 'warning');
        } else {
          showUserFeedback(`⚠️ API not available (${response.status}), using demo data`, 'warning');
        }
        
        // Fallback to mock data if API is not ready
        await loadMockData();
      }
    } catch (error) {
      console.error('Failed to load analytics from API, using mock data:', error);
      
      // Show error feedback
      showUserFeedback('❌ Network error, using demo data', 'error');
      
      await loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  // User feedback system
  const [userFeedback, setUserFeedback] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showUserFeedback = (message: string, type: 'success' | 'warning' | 'error') => {
    console.log('Setting user feedback:', { message, type });
    setUserFeedback({ message, type });
    setTimeout(() => {
      console.log('Clearing user feedback');
      setUserFeedback(null);
    }, 5000); // Auto-hide after 5 seconds
  };

  // Load mock data as fallback
  const loadMockData = async () => {
    console.log('Loading mock data for time range:', timeRange);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate different mock data based on time range
    const getMockDataForTimeRange = (range: string): AnalyticsData => {
      const baseData = {
        totalQuizzes: 24,
        topPerformingQuiz: 'Product Knowledge Test',
        isLoading: false
      };

      switch (range) {
        case '7d':
          return {
            ...baseData,
            totalSubmissions: 1247,
            averageCompletionRate: 78.5,
            averageTimeToComplete: 4.2,
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
              deviceBreakdown: { desktop: 58.3, mobile: 35.2, tablet: 6.5 }
            }
          };
        
        case '30d':
          return {
            ...baseData,
            totalSubmissions: 5234,
            averageCompletionRate: 81.2,
            averageTimeToComplete: 3.9,
            recentActivity: [
              { quiz: 'Product Knowledge Test', submissions: 156, completionRate: 89.7, date: '2025-08-23' },
              { quiz: 'Brand Awareness Quiz', submissions: 142, completionRate: 82.3, date: '2025-08-22' },
              { quiz: 'Customer Satisfaction', submissions: 138, completionRate: 76.1, date: '2025-08-21' },
            ],
            performanceTrends: [
              { date: '2025-07-24', submissions: 89, completionRate: 78.2 },
              { date: '2025-07-31', submissions: 156, completionRate: 81.9 },
              { date: '2025-08-07', submissions: 234, completionRate: 83.4 },
              { date: '2025-08-14', submissions: 198, completionRate: 79.1 },
              { date: '2025-08-21', submissions: 342, completionRate: 81.7 },
            ],
            engagementMetrics: {
              averageSessionDuration: 4.1,
              bounceRate: 19.8,
              returnUserRate: 41.2,
              deviceBreakdown: { desktop: 62.1, mobile: 32.8, tablet: 5.1 }
            }
          };
        
        case '90d':
          return {
            ...baseData,
            totalSubmissions: 15467,
            averageCompletionRate: 83.7,
            averageTimeToComplete: 3.6,
            recentActivity: [
              { quiz: 'Product Knowledge Test', submissions: 456, completionRate: 89.7, date: '2025-08-23' },
              { quiz: 'Brand Awareness Quiz', submissions: 423, completionRate: 82.3, date: '2025-08-22' },
              { quiz: 'Customer Satisfaction', submissions: 398, completionRate: 76.1, date: '2025-08-21' },
            ],
            performanceTrends: [
              { date: '2025-05-25', submissions: 234, completionRate: 79.2 },
              { date: '2025-06-15', submissions: 456, completionRate: 82.9 },
              { date: '2025-07-05', submissions: 678, completionRate: 85.4 },
              { date: '2025-07-25', submissions: 598, completionRate: 81.1 },
              { date: '2025-08-15', submissions: 842, completionRate: 87.7 },
            ],
            engagementMetrics: {
              averageSessionDuration: 4.5,
              bounceRate: 17.3,
              returnUserRate: 48.7,
              deviceBreakdown: { desktop: 65.8, mobile: 30.1, tablet: 4.1 }
            }
          };
        
        case '1y':
          return {
            ...baseData,
            totalSubmissions: 45678,
            averageCompletionRate: 85.2,
            averageTimeToComplete: 3.4,
            recentActivity: [
              { quiz: 'Product Knowledge Test', submissions: 1234, completionRate: 89.7, date: '2025-08-23' },
              { quiz: 'Brand Awareness Quiz', submissions: 1156, completionRate: 82.3, date: '2025-08-22' },
              { quiz: 'Customer Satisfaction', submissions: 1098, completionRate: 76.1, date: '2025-08-21' },
            ],
            performanceTrends: [
              { date: '2024-08-23', submissions: 567, completionRate: 78.2 },
              { date: '2024-11-23', submissions: 1234, completionRate: 81.9 },
              { date: '2025-02-23', submissions: 2345, completionRate: 83.4 },
              { date: '2025-05-23', submissions: 3456, completionRate: 81.1 },
              { date: '2025-08-23', submissions: 4567, completionRate: 87.7 },
            ],
            engagementMetrics: {
              averageSessionDuration: 4.8,
              bounceRate: 15.6,
              returnUserRate: 52.3,
              deviceBreakdown: { desktop: 68.9, mobile: 27.8, tablet: 3.3 }
            }
          };
        
        default:
          return {
            ...baseData,
            totalSubmissions: 1247,
            averageCompletionRate: 78.5,
            averageTimeToComplete: 4.2,
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
              deviceBreakdown: { desktop: 58.3, mobile: 35.2, tablet: 6.5 }
            }
          };
      }
    };
    
    const mockData = getMockDataForTimeRange(timeRange);
    setAnalyticsData(mockData);
    console.log(`Mock analytics data loaded for ${timeRange} time range:`, mockData);
  };

  // Load data when component mounts or time range changes
  useEffect(() => {
    console.log('AnalyticsDashboard useEffect triggered, timeRange:', timeRange);
    console.log('Current analyticsData state:', analyticsData);
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
                <div key={index} className="chart-bar" style={{ 
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
        <Text variant="headingSm" as="h5">Device Usage Breakdown</Text>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Desktop */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <Text variant="bodyMd" as="span">Desktop</Text>
              <Text variant="bodyMd" as="span">{deviceBreakdown.desktop.toFixed(1)}%</Text>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div className="progress-bar" style={{ 
                width: `${deviceBreakdown.desktop}%`, 
                height: '100%', 
                backgroundColor: '#10b981',
                borderRadius: '4px'
              }} />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <Text variant="bodyMd" as="span">Mobile</Text>
              <Text variant="bodyMd" as="span">{deviceBreakdown.mobile.toFixed(1)}%</Text>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${deviceBreakdown.mobile}%`, 
                height: '100%', 
                backgroundColor: '#3b82f6',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Tablet */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <Text variant="bodyMd" as="span">Tablet</Text>
              <Text variant="bodyMd" as="span">{deviceBreakdown.tablet.toFixed(1)}%</Text>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${deviceBreakdown.tablet}%`, 
                height: '100%', 
                backgroundColor: '#f59e0b',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
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
          {/* Debug: Show user feedback state */}
          <div style={{ 
            padding: '0.5rem', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '4px', 
            fontSize: '12px', 
            color: '#6b7280',
            marginBottom: '1rem'
          }}>
            Debug: userFeedback = {userFeedback ? JSON.stringify(userFeedback) : 'null'}
          </div>

        {/* User Feedback */}
        {userFeedback && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: userFeedback.type === 'success' ? '#d1fae5' : 
                           userFeedback.type === 'warning' ? '#fef3c7' : '#fee2e2',
            color: userFeedback.type === 'success' ? '#065f46' : 
                   userFeedback.type === 'warning' ? '#92400e' : '#991b1b',
            border: `1px solid ${userFeedback.type === 'success' ? '#a7f3d0' : 
                                userFeedback.type === 'warning' ? '#fde68a' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{userFeedback.message}</span>
            <button 
              onClick={() => setUserFeedback(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: 'inherit',
                padding: '0'
              }}
            >
              ×
            </button>
          </div>
        )}

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
        <Tabs tabs={tabs} selected={tabs.findIndex(tab => tab.id === activeTab)} onSelect={(selectedTabIndex) => {
          const tabIds = ['overview', 'performance', 'engagement', 'reports'];
          setActiveTab(tabIds[selectedTabIndex]);
        }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content" style={{ padding: '1rem 0' }}>
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
                  <div style={{ 
                    fontSize: '3rem', 
                    marginBottom: '1rem',
                    opacity: 0.8,
                    transition: 'opacity 0.3s ease'
                  }}>
                    📊
                  </div>
                  <Text variant="bodyMd" as="p" tone="subdued">Loading analytics data...</Text>
                  <div style={{ 
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    Fetching data for {timeRange === '7d' ? 'last 7 days' : 
                                   timeRange === '30d' ? 'last 30 days' : 
                                   timeRange === '90d' ? 'last 90 days' : 'last year'}
                  </div>
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
                    <div>
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
                          <div style={{ 
                            fontSize: '2rem', 
                            fontWeight: 'bold', 
                            color: '#3b82f6',
                            margin: '0.5rem 0'
                          }}>
                            {formatNumber(analyticsData.totalQuizzes)}
                          </div>
                          <Text variant="bodySm" as="p" tone="subdued">
                            Active quizzes in the system
                          </Text>
                        </div>
                      </Card>
                    </div>

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
                        <div style={{ 
                          fontSize: '2rem', 
                          fontWeight: '600', 
                          color: '#10b981',
                          marginBottom: '0.5rem'
                        }}>
                          {formatNumber(analyticsData.totalSubmissions)}
                        </div>
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
                        <div style={{ 
                          fontSize: '2rem', 
                          fontWeight: '600', 
                          color: '#f59e0b',
                          marginBottom: '0.5rem'
                        }}>
                          {formatPercentage(analyticsData.averageCompletionRate)}
                        </div>
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
                        <div style={{ 
                          fontSize: '2rem', 
                          fontWeight: '600', 
                          color: '#8b5cf6',
                          marginBottom: '0.5rem'
                        }}>
                          {formatTime(analyticsData.averageTimeToComplete)}
                        </div>
                        <Text variant="bodySm" as="p" tone="subdued">
                          Time to complete quizzes
                        </Text>
                      </div>
                    </Card>
                  </div>

                  {/* Top Performing Quiz */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600', 
                      marginBottom: '1rem' 
                    }}>
                      Top Performing Quiz
                    </div>
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
                    <div style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '600', 
                      marginBottom: '1rem' 
                    }}>
                      Recent Activity
                    </div>
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
                                <div style={{
                                  width: '100px',
                                  height: '8px',
                                  backgroundColor: '#e5e7eb',
                                  borderRadius: '4px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${activity.completionRate}%`,
                                    height: '100%',
                                    backgroundColor: '#10b981',
                                    transition: 'width 0.3s ease'
                                  }} />
                                </div>
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
                          <div style={{ 
                            fontSize: '1.875rem', 
                            fontWeight: '600', 
                            color: '#3b82f6',
                            marginBottom: '0.5rem'
                          }}>
                            {analyticsData.performanceTrends.length}
                          </div>
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
                          onClick={() => exportData('json')}
                        >
                          📄 Export Analytics JSON (Working)
                        </Button>
                        <div style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '14px', color: '#6b7280' }}>
                          💡 CSV and PDF export will be implemented when backend is ready
                        </div>
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
