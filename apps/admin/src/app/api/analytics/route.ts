import { NextRequest, NextResponse } from 'next/server';

// Mock analytics data for development
const getMockAnalyticsData = (timeRange: string) => {
  const baseData = {
    totalQuizzes: 24,
    topPerformingQuiz: 'Product Knowledge Test',
  };

  switch (timeRange) {
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
          { date: '2024-08-23', submissions: 234, completionRate: 79.2 },
          { date: '2024-11-23', submissions: 456, completionRate: 82.9 },
          { date: '2025-02-23', submissions: 678, completionRate: 85.4 },
          { date: '2025-05-23', submissions: 598, completionRate: 81.1 },
          { date: '2025-08-23', submissions: 842, completionRate: 87.7 },
        ],
        engagementMetrics: {
          averageSessionDuration: 4.8,
          bounceRate: 15.2,
          returnUserRate: 52.3,
          deviceBreakdown: { desktop: 68.5, mobile: 28.2, tablet: 3.3 }
        }
      };
    
    default:
      return {
        ...baseData,
        totalSubmissions: 1247,
        averageCompletionRate: 78.5,
        averageTimeToComplete: 4.2,
        recentActivity: [],
        performanceTrends: [],
        engagementMetrics: {
          averageSessionDuration: 3.8,
          bounceRate: 22.4,
          returnUserRate: 34.7,
          deviceBreakdown: { desktop: 58.3, mobile: 35.2, tablet: 6.5 }
        }
      };
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    
    console.log('Mock analytics API called with timeRange:', timeRange);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const data = getMockAnalyticsData(timeRange);
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Mock analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate mock analytics data' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
