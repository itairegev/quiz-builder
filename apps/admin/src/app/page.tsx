'use client';

import { Page, Layout, Card, Text, Badge, Button } from '@shopify/polaris';
import QuizPreview from '../components/QuizPreview';
import ThemeManager from '../components/ThemeManager';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function DashboardPage() {
  return (
    <Page
      title="Quiz Builder Dashboard"
      subtitle="Manage your quizzes, themes, and analytics in one place"
      primaryAction={{
        content: 'Create New Quiz',
        onAction: () => {},
        icon: '📝'
      }}
      secondaryActions={[
        {
          content: 'View Documentation',
          onAction: () => window.open('/docs', '_blank'),
        },
        {
          content: 'Get Support',
          onAction: () => window.open('/support', '_blank'),
        }
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                  <Text variant="headingMd" as="h3">
                    Quick Stats
                  </Text>
                </div>
                <Badge tone="info">Live Data</Badge>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '1rem'
              }}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ color: '#3b82f6', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '600' }}>
                    0
                  </div>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Active Quizzes
                  </Text>
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ color: '#10b981', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
                    0
                  </div>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Total Submissions
                  </Text>
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ color: '#f59e0b', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '600' }}>
                    0%
                  </div>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Conversion Rate
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  🚀
                </div>
                <Text variant="headingMd" as="h3">
                  Getting Started
                </Text>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1rem'
              }}>
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #0ea5e9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Badge tone="info">1</Badge>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      Create Your First Quiz
                    </Text>
                  </div>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Use our guided builder to create engaging quizzes
                  </Text>
                </div>
                
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Badge tone="warning">2</Badge>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      Customize Design
                    </Text>
                  </div>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Match your brand with our theme customization
                  </Text>
                </div>
                
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: '#f3e8ff',
                  borderRadius: '8px',
                  border: '1px solid #8b5cf6'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Badge tone="success">3</Badge>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      Shopify Integration
                    </Text>
                  </div>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Seamlessly integrate with your store
                  </Text>
                </div>
                
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: '#ecfdf5',
                  borderRadius: '8px',
                  border: '1px solid #10b981'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Badge tone="success">4</Badge>
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      Launch & Collect
                    </Text>
                  </div>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Start collecting leads and driving sales
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#8b5cf6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  ⏰
                </div>
                <Text variant="headingMd" as="h3">
                  Recent Activity
                </Text>
              </div>
              
              <div style={{ 
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  fontSize: '32px'
                }}>
                  📝
                </div>
                <Text variant="bodyMd" as="p" tone="subdued">
                  No recent activity. Create your first quiz to get started!
                </Text>
                <div style={{ marginTop: '1rem' }}>
                  <Button size="micro" variant="primary">
                    Create Quiz Now
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <QuizPreview />
        </Layout.Section>

        <Layout.Section>
          <ThemeManager />
        </Layout.Section>

        <Layout.Section>
          <AnalyticsDashboard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
