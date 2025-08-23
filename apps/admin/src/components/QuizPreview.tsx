'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Text, 
  Button, 
  Tabs,
  Badge
} from '@shopify/polaris';

export default function QuizPreview() {
  const [selectedQuizId, setSelectedQuizId] = useState('test-quiz');
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 'preview', content: 'Preview' },
    { id: 'validation', content: 'Validation' },
    { id: 'embed', content: 'Embed Codes' },
    { id: 'summary', content: 'Summary' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <div style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <Text variant="headingMd" as="h3">
              Quiz Preview
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Test and validate your quiz configuration
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="text"
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              placeholder="Enter quiz ID"
              style={{
                padding: '0.5rem',
                border: '1px solid #c9cccf',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <Button onClick={() => console.log('Load quiz:', selectedQuizId)}>
              Load Quiz
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} selected={activeTab} onSelect={setActiveTab}>
          {/* Preview Tab */}
          {activeTab === 0 && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Text variant="headingMd" as="h4">
                  Test Quiz Preview
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  ID: {selectedQuizId}
                </Text>
                <Text variant="bodyMd" as="p">
                  Preview system is working! This is a test quiz preview.
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Last updated: {new Date().toISOString()}
                </Text>
              </div>
            </div>
          )}

          {/* Validation Tab */}
          {activeTab === 1 && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <Badge tone="success">
                    Valid
                  </Badge>
                  <Text variant="headingMd" as="h4">
                    Quiz Configuration
                  </Text>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <Text variant="headingSm" as="h5" tone="caution">
                    Warnings (1)
                  </Text>
                  <ul>
                    <li>
                      <strong>theme:</strong> Consider adding more theme customization
                      <br />
                      <small style={{ color: '#6d7175' }}>Suggestion: Add custom colors and fonts</small>
                    </li>
                  </ul>
                </div>

                <div>
                  <Text variant="headingSm" as="h5">
                    Improvement Suggestions
                  </Text>
                  <ul>
                    <li>Add custom theme to match your brand</li>
                    <li>Enable progress bar to improve user experience</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Embed Codes Tab */}
          {activeTab === 2 && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Text variant="headingMd" as="h4">
                  Embed Codes
                </Text>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <Text variant="headingSm" as="h5">
                      Iframe Embed
                    </Text>
                    <Button onClick={() => copyToClipboard(`<iframe src="http://localhost:3000/quiz-preview/${selectedQuizId}" width="100%" height="600px" frameborder="0"></iframe>`)}>
                      Copy
                    </Button>
                  </div>
                  <div style={{ 
                    backgroundColor: '#f6f6f7', 
                    padding: '0.75rem', 
                    borderRadius: '4px', 
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    border: '1px solid #e1e3e5'
                  }}>
                    {`<iframe src="http://localhost:3000/quiz-preview/${selectedQuizId}" width="100%" height="600px" frameborder="0"></iframe>`}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <Text variant="headingSm" as="h5">
                      JavaScript Embed
                    </Text>
                    <Button onClick={() => copyToClipboard(`<script src="http://localhost:3000/quiz-embed.js" data-quiz-id="${selectedQuizId}"></script>`)}>
                      Copy
                    </Button>
                  </div>
                  <div style={{ 
                    backgroundColor: '#f6f6f7', 
                    padding: '0.75rem', 
                    borderRadius: '4px', 
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    border: '1px solid #e1e3e5'
                  }}>
                    {`<script src="http://localhost:3000/quiz-embed.js" data-quiz-id="${selectedQuizId}"></script>`}
                  </div>
                </div>

                <div>
                  <Text variant="headingSm" as="h5">
                    Customization Options
                  </Text>
                  <ul>
                    <li>Customize width and height</li>
                    <li>Add custom CSS classes</li>
                    <li>Modify border and shadow</li>
                    <li>Change background color</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 3 && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Text variant="headingMd" as="h4">
                  Quiz Summary
                </Text>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '1rem', border: '1px solid #e1e3e5', borderRadius: '8px' }}>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Total Questions
                    </Text>
                    <Text variant="headingMd" as="p">
                      5
                    </Text>
                  </div>

                  <div style={{ padding: '1rem', border: '1px solid #e1e3e5', borderRadius: '8px' }}>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Required Questions
                    </Text>
                    <Text variant="headingMd" as="p">
                      3
                    </Text>
                  </div>

                  <div style={{ padding: '1rem', border: '1px solid #e1e3e5', borderRadius: '8px' }}>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Estimated Time
                    </Text>
                    <Text variant="headingMd" as="p">
                      3 min
                    </Text>
                  </div>

                  <div style={{ padding: '1rem', border: '1px solid #e1e3e5', borderRadius: '8px' }}>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Logic Rules
                    </Text>
                    <Text variant="headingMd" as="p">
                      Yes
                    </Text>
                  </div>

                  <div style={{ padding: '1rem', border: '1px solid #e1e3e5', borderRadius: '8px' }}>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Custom Theme
                    </Text>
                    <Text variant="headingMd" as="p">
                      No
                    </Text>
                  </div>
                </div>

                <div>
                  <Text variant="headingSm" as="h5">
                    Preview URL
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      backgroundColor: '#f6f6f7', 
                      padding: '0.75rem', 
                      borderRadius: '4px', 
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      border: '1px solid #e1e3e5'
                    }}>
                      {`http://localhost:3000/quiz-preview/${selectedQuizId}`}
                    </div>
                    <Button onClick={() => copyToClipboard(`http://localhost:3000/quiz-preview/${selectedQuizId}`)}>
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Tabs>

        {/* Refresh Button */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Button onClick={() => console.log('Refresh data')}>
            Refresh Data
          </Button>
        </div>
      </div>
    </Card>
  );
}
