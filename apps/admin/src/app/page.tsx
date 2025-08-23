'use client';

import { Page, Layout, Card, Text, Badge } from '@shopify/polaris';
import QuizPreview from '../components/QuizPreview';

export default function DashboardPage() {
  return (
    <Page
      title="Dashboard"
      subtitle="Welcome to your Shopify Quiz Builder dashboard"
      primaryAction={{
        content: 'Create New Quiz',
        onAction: () => {},
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ padding: '1rem' }}>
                <div>
                  <Text variant="headingMd" as="h3">
                    Quick Stats
                  </Text>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ textAlign: 'center' }}>
                        <Text variant="headingLg" as="p">
                          0
                        </Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          Active Quizzes
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text variant="headingMd" as="p">
                          0
                        </Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          Total Submissions
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text variant="headingLg" as="p">
                          0%
                        </Text>
                        <Text variant="bodySm" as="p" tone="subdued">
                          Conversion Rate
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ padding: '1rem' }}>
                <div>
                  <Text variant="headingMd" as="h3">
                    Getting Started
                  </Text>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge tone="info">1</Badge>
                        <Text variant="bodyMd" as="p">
                          Create your first quiz using our guided builder
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge tone="info">2</Badge>
                        <Text variant="bodyMd" as="p">
                          Customize the design to match your brand
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge tone="info">3</Badge>
                        <Text variant="bodyMd" as="p">
                          Integrate with your Shopify store
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge tone="info">4</Badge>
                        <Text variant="bodyMd" as="p">
                          Start collecting leads and driving sales
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ padding: '1rem' }}>
                <div>
                  <Text variant="headingMd" as="h3">
                    Recent Activity
                  </Text>
                  <div style={{ marginTop: '1rem' }}>
                    <Text variant="bodyMd" as="p" tone="subdued">
                      No recent activity. Create your first quiz to get started!
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <QuizPreview />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
