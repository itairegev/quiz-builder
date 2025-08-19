'use client';

import { Page, Layout, Card, Text, Button, Stack, Badge } from '@shopify/polaris';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Page title="Dashboard">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <Text variant="headingLg" as="h2">
                  Loading...
                </Text>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Dashboard"
      subtitle="Welcome to your Shopify Quiz Builder dashboard"
      primaryAction={{
        content: 'Create New Quiz',
        onAction: () => console.log('Create quiz clicked'),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <Stack vertical spacing="loose">
                <div>
                  <Text variant="headingMd" as="h3">
                    Quick Stats
                  </Text>
                  <div style={{ marginTop: '1rem' }}>
                    <Stack distribution="equalSpacing">
                      <div style={{ textAlign: 'center' }}>
                        <Text variant="headingLg" as="p">
                          0
                        </Text>
                        <Text variant="bodySm" as="p" color="subdued">
                          Active Quizzes
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text variant="headingLg" as="p">
                          0
                        </Text>
                        <Text variant="bodySm" as="p" color="subdued">
                          Total Submissions
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Text variant="headingLg" as="p">
                          0%
                        </Text>
                        <Text variant="bodySm" as="p" color="subdued">
                          Conversion Rate
                        </Text>
                      </div>
                    </Stack>
                  </div>
                </div>
              </Stack>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <Stack vertical spacing="loose">
                <div>
                  <Text variant="headingMd" as="h3">
                    Getting Started
                  </Text>
                  <div style={{ marginTop: '1rem' }}>
                    <Stack vertical spacing="tight">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge status="info">1</Badge>
                        <Text variant="bodyMd">
                          Create your first quiz using our guided builder
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge status="info">2</Badge>
                        <Text variant="bodyMd">
                          Customize the design to match your brand
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge status="info">3</Badge>
                        <Text variant="bodyMd">
                          Integrate with your Shopify store
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge status="info">4</Badge>
                        <Text variant="bodyMd">
                          Start collecting leads and driving sales
                        </Text>
                      </div>
                    </Stack>
                  </div>
                </div>
              </Stack>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '1.5rem' }}>
              <Stack vertical spacing="loose">
                <div>
                  <Text variant="headingMd" as="h3">
                    Recent Activity
                  </Text>
                  <div style={{ marginTop: '1rem' }}>
                    <Text variant="bodyMd" color="subdued">
                      No recent activity. Create your first quiz to get started!
                    </Text>
                  </div>
                </div>
              </Stack>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
