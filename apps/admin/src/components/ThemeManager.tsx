'use client';

import { useState } from 'react';
import { 
  Card, 
  Text, 
  Button, 
  Tabs,
  Badge
} from '@shopify/polaris';

export default function ThemeManager() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 'colors', content: 'Colors' },
    { id: 'typography', content: 'Typography' },
    { id: 'layout', content: 'Layout' },
    { id: 'preview', content: 'Preview' },
  ];

  return (
    <Card>
      <div style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <Text variant="headingMd" as="h3">
              Theme Manager
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Customize the look and feel of your quizzes
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button onClick={() => console.log('Reset to defaults')}>
              Reset to Defaults
            </Button>
            <Button primary onClick={() => console.log('Save theme')}>
              Save Theme
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} selected={activeTab} onSelect={setActiveTab}>
          {/* Colors Tab */}
          {activeTab === 0 && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Text variant="headingMd" as="h4">
                  Color Scheme
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Customize the primary colors and visual elements
                </Text>
              </div>
              
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <Text variant="headingSm" as="h5">Primary Color</Text>
                    <Text variant="bodySm" tone="subdued">Main brand color for buttons and highlights</Text>
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input
                        type="color"
                        defaultValue="#3b82f6"
                        style={{
                          width: '50px',
                          height: '40px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="text"
                        defaultValue="#3b82f6"
                        placeholder="#3b82f6"
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #c9cccf',
                          borderRadius: '4px',
                          fontSize: '14px',
                          width: '120px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Text variant="headingSm" as="h5">Secondary Color</Text>
                    <Text variant="bodySm" tone="subdued">Accent color for secondary elements</Text>
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input
                        type="color"
                        defaultValue="#64748b"
                        style={{
                          width: '50px',
                          height: '40px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="text"
                        defaultValue="#64748b"
                        placeholder="#64748b"
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #c9cccf',
                          borderRadius: '4px',
                          fontSize: '14px',
                          width: '120px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Text variant="headingSm" as="h5">Background Color</Text>
                    <Text variant="bodySm" tone="subdued">Main background color for the quiz</Text>
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input
                        type="color"
                        defaultValue="#ffffff"
                        style={{
                          width: '50px',
                          height: '40px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="text"
                        defaultValue="#ffffff"
                        placeholder="#ffffff"
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #c9cccf',
                          borderRadius: '4px',
                          fontSize: '14px',
                          width: '120px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Text variant="headingSm" as="h5">Text Color</Text>
                    <Text variant="bodySm" tone="subdued">Primary text color for readability</Text>
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input
                        type="color"
                        defaultValue="#374151"
                        style={{
                          width: '50px',
                          height: '40px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="text"
                        defaultValue="#374151"
                        placeholder="#374151"
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #c9cccf',
                          borderRadius: '4px',
                          fontSize: '14px',
                          width: '120px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 1 && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Text variant="headingMd" as="h4">
                  Typography Settings
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Customize fonts and text styling
                </Text>
              </div>
              
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <Text variant="headingSm" as="h5">Font Family</Text>
                    <Text variant="bodySm" tone="subdued">Choose the main font for your quiz</Text>
                    <select
                      defaultValue="Inter"
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        border: '1px solid #c9cccf',
                        borderRadius: '4px',
                        fontSize: '14px',
                        width: '200px'
                      }}
                    >
                      <option value="Inter">Inter (Default)</option>
                      <option value="Arial">Arial</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>

                  <div>
                    <Text variant="headingSm" as="h5">Font Size</Text>
                    <Text variant="bodySm" tone="subdued">Base font size for the quiz</Text>
                    <input
                      type="text"
                      defaultValue="16px"
                      placeholder="16px"
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        border: '1px solid #c9cccf',
                        borderRadius: '4px',
                        fontSize: '14px',
                        width: '120px'
                      }}
                    />
                  </div>

                  <div>
                    <Text variant="headingSm" as="h5">Preview</Text>
                    <Text variant="bodySm" tone="subdued">See how your typography will look</Text>
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '1rem', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb'
                    }}>
                      <Text variant="headingLg" as="h3" style={{ fontFamily: 'Inter' }}>
                        Sample Heading
                      </Text>
                      <Text variant="bodyMd" as="p" style={{ fontFamily: 'Inter' }}>
                        This is how your quiz text will appear with the selected font and size.
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layout Tab */}
          {activeTab === 2 && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Text variant="headingMd" as="h4">
                  Layout & Style Options
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Customize the layout and visual style of your quiz
                </Text>
              </div>
              
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <Text variant="headingSm" as="h5">Layout Style</Text>
                    <Text variant="bodySm" tone="subdued">Choose how questions are displayed</Text>
                    <select
                      defaultValue="single-column"
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        border: '1px solid #c9cccf',
                        borderRadius: '4px',
                        fontSize: '14px',
                        width: '200px'
                      }}
                    >
                      <option value="single-column">Single Column</option>
                      <option value="two-column">Two Column</option>
                      <option value="card">Card Layout</option>
                    </select>
                  </div>

                  <div>
                    <Text variant="headingSm" as="h5">Button Style</Text>
                    <Text variant="bodySm" tone="subdued">Choose the button appearance</Text>
                    <select
                      defaultValue="rounded"
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        border: '1px solid #c9cccf',
                        borderRadius: '4px',
                        fontSize: '14px',
                        width: '200px'
                      }}
                    >
                      <option value="rounded">Rounded</option>
                      <option value="square">Square</option>
                      <option value="pill">Pill</option>
                    </select>
                  </div>

                  <div>
                    <Text variant="headingSm" as="h5">Border Radius</Text>
                    <Text variant="bodySm" tone="subdued">Corner roundness for elements</Text>
                    <input
                      type="text"
                      defaultValue="8px"
                      placeholder="8px"
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        border: '1px solid #c9cccf',
                        borderRadius: '4px',
                        fontSize: '14px',
                        width: '120px'
                      }}
                    />
                  </div>

                  <div>
                    <Text variant="headingSm" as="h5">Animation Style</Text>
                    <Text variant="bodySm" tone="subdued">Choose transition effects</Text>
                    <select
                      defaultValue="fade"
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        border: '1px solid #c9cccf',
                        borderRadius: '4px',
                        fontSize: '14px',
                        width: '200px'
                      }}
                    >
                      <option value="none">None</option>
                      <option value="fade">Fade</option>
                      <option value="slide">Slide</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 3 && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Text variant="headingMd" as="h4">
                  Theme Preview
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  See how your theme will look in action
                </Text>
              </div>
              
              <div style={{ padding: '1rem' }}>
                <div style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px',
                  padding: '2rem',
                  backgroundColor: '#ffffff',
                  maxWidth: '500px'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Text variant="headingLg" as="h3" style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>
                      Sample Quiz Question
                    </Text>
                    <Text variant="bodyMd" as="p" style={{ color: '#64748b' }}>
                      This is how your quiz will look with the current theme settings.
                    </Text>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Text variant="headingMd" as="h4" style={{ marginBottom: '1rem' }}>
                      What's your favorite color?
                    </Text>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button style={{
                        padding: '0.75rem 1rem',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontFamily: 'Inter'
                      }}>
                        Blue
                      </button>
                      <button style={{
                        padding: '0.75rem 1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        color: '#374151',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontFamily: 'Inter'
                      }}>
                        Green
                      </button>
                      <button style={{
                        padding: '0.75rem 1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        color: '#374151',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontFamily: 'Inter'
                      }}>
                        Red
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontFamily: 'Inter'
                    }}>
                      Next Question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </Card>
  );
}
