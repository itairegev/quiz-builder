'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Text,
  Button,
  Tabs,
  Badge
} from '@shopify/polaris';

export default function ThemeManager() {
  const [activeTab, setActiveTab] = useState(0);
  
  // Color scheme state
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#64748b');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#374151');

  // Typography state
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState('16px');

  // Layout and style state
  const [layoutStyle, setLayoutStyle] = useState('single-column');
  const [buttonStyle, setButtonStyle] = useState('rounded');
  const [borderRadius, setBorderRadius] = useState('8px');
  const [animationStyle, setAnimationStyle] = useState('fade');

  // Load saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('quizTheme');
    if (savedTheme) {
      try {
        const themeConfig = JSON.parse(savedTheme);
        
        // Update all state variables
        setPrimaryColor(themeConfig.primaryColor || '#3b82f6');
        setSecondaryColor(themeConfig.secondaryColor || '#64748b');
        setBackgroundColor(themeConfig.backgroundColor || '#ffffff');
        setTextColor(themeConfig.textColor || '#374151');
        setFontFamily(themeConfig.fontFamily || 'Inter');
        setFontSize(themeConfig.fontSize || '16px');
        setLayoutStyle(themeConfig.layoutStyle || 'single-column');
        setButtonStyle(themeConfig.buttonStyle || 'rounded');
        setBorderRadius(themeConfig.borderRadius || '8px');
        setAnimationStyle(themeConfig.animationStyle || 'fade');
        
        console.log('Theme loaded from localStorage on mount:', themeConfig);
      } catch (error) {
        console.error('Failed to load theme on mount:', error);
      }
    }
  }, []);

  const tabs = [
    { id: 'colors', content: 'Colors' },
    { id: 'typography', content: 'Typography' },
    { id: 'layout', content: 'Layout' },
    { id: 'preview', content: 'Preview' },
  ];

  // Color validation helper
  const isValidHexColor = (color: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  // Get input border color based on validation
  const getInputBorderColor = (color: string) => {
    if (color === '') return '#c9cccf'; // Default border
    if (isValidHexColor(color)) return '#10b981'; // Green for valid
    return '#ef4444'; // Red for invalid
  };

  // Color update handlers
  const updatePrimaryColor = (color: string) => {
    setPrimaryColor(color);
  };

  const updateSecondaryColor = (color: string) => {
    setSecondaryColor(color);
  };

  const updateBackgroundColor = (color: string) => {
    setBackgroundColor(color);
  };

  const updateTextColor = (color: string) => {
    setTextColor(color);
  };

  // Typography update handlers
  const updateFontFamily = (family: string) => {
    setFontFamily(family);
  };

  const updateFontSize = (size: string) => {
    // Basic validation for font size
    if (size.match(/^\d+(\.\d+)?(px|rem|em|%)$/)) {
      setFontSize(size);
    }
  };

  // Layout and style update handlers
  const updateLayoutStyle = (style: string) => {
    setLayoutStyle(style);
  };

  const updateButtonStyle = (style: string) => {
    setButtonStyle(style);
  };

  const updateBorderRadius = (radius: string) => {
    // Basic validation for border radius
    if (radius.match(/^\d+(\.\d+)?(px|rem|em|%)$/)) {
      setBorderRadius(radius);
    }
  };

  const updateAnimationStyle = (style: string) => {
    setAnimationStyle(style);
  };

  // Helper function to get button border radius based on style
  const getButtonBorderRadius = () => {
    switch (buttonStyle) {
      case 'rounded': return borderRadius;
      case 'square': return '0px';
      case 'pill': return '50px';
      default: return borderRadius;
    }
  };

  // Helper function to get animation styles
  const getAnimationStyles = () => {
    switch (animationStyle) {
      case 'none': return {};
      case 'fade': return { 
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer'
      };
      case 'slide': return { 
        transition: 'all 0.3s ease-in-out',
        transform: 'translateX(0)',
        cursor: 'pointer'
      };
      default: return { 
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer'
      };
    }
  };

  // Reset to default theme colors, typography, and layout
  const resetToDefaults = () => {
    setPrimaryColor('#3b82f6');
    setSecondaryColor('#64748b');
    setBackgroundColor('#ffffff');
    setTextColor('#374151');
    setFontFamily('Inter');
    setFontSize('16px');
    setLayoutStyle('single-column');
    setButtonStyle('rounded');
    setBorderRadius('8px');
    setAnimationStyle('fade');
  };

  // Save current theme configuration
  const saveTheme = () => {
    const themeConfig = {
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      fontFamily,
      fontSize,
      layoutStyle,
      buttonStyle,
      borderRadius,
      animationStyle,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage for now (will be replaced with backend API)
    try {
      localStorage.setItem('quizTheme', JSON.stringify(themeConfig));
      console.log('Theme saved to localStorage:', themeConfig);
      
      // Show success message (you can replace this with a toast notification)
      alert('Theme saved successfully! 🎨');
    } catch (error) {
      console.error('Failed to save theme:', error);
      alert('Failed to save theme. Please try again.');
    }
  };

  // Load saved theme configuration
  const loadTheme = () => {
    try {
      const savedTheme = localStorage.getItem('quizTheme');
      console.log('Raw saved theme from localStorage:', savedTheme);
      
      if (savedTheme) {
        const themeConfig = JSON.parse(savedTheme);
        console.log('Parsed theme config:', themeConfig);
        
        // Update all state variables with explicit values
        const newPrimaryColor = themeConfig.primaryColor || '#3b82f6';
        const newSecondaryColor = themeConfig.secondaryColor || '#64748b';
        const newBackgroundColor = themeConfig.backgroundColor || '#ffffff';
        const newTextColor = themeConfig.textColor || '#374151';
        const newFontFamily = themeConfig.fontFamily || 'Inter';
        const newFontSize = themeConfig.fontSize || '16px';
        const newLayoutStyle = themeConfig.layoutStyle || 'single-column';
        const newButtonStyle = themeConfig.buttonStyle || 'rounded';
        const newBorderRadius = themeConfig.borderRadius || '8px';
        const newAnimationStyle = themeConfig.animationStyle || 'fade';
        
        console.log('New values to set:', {
          newPrimaryColor,
          newSecondaryColor,
          newBackgroundColor,
          newTextColor,
          newFontFamily,
          newFontSize,
          newLayoutStyle,
          newButtonStyle,
          newBorderRadius,
          newAnimationStyle
        });
        
        // Update all state variables
        setPrimaryColor(newPrimaryColor);
        setSecondaryColor(newSecondaryColor);
        setBackgroundColor(newBackgroundColor);
        setTextColor(newTextColor);
        setFontFamily(newFontFamily);
        setFontSize(newFontSize);
        setLayoutStyle(newLayoutStyle);
        setButtonStyle(newButtonStyle);
        setBorderRadius(newBorderRadius);
        setAnimationStyle(newAnimationStyle);
        
        console.log('All state variables updated');
        alert('Theme loaded successfully! 🎨\n\nCheck the console for debugging info.');
      } else {
        console.log('No saved theme found in localStorage');
        alert('No saved theme found. Using default settings.');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      alert('Failed to load theme. Using default settings.\n\nError: ' + error.message);
    }
  };

  // Export theme configuration
  const exportTheme = () => {
    const themeConfig = {
      name: 'Custom Quiz Theme',
      description: 'Exported theme with custom colors, typography, and layout settings',
      version: '1.0',
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      fontFamily,
      fontSize,
      layoutStyle,
      buttonStyle,
      borderRadius,
      animationStyle,
      timestamp: new Date().toISOString()
    };
    
    // Create and download JSON file
    const dataStr = JSON.stringify(themeConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `quiz-theme-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    console.log('Theme exported:', themeConfig);
  };

  // Import theme configuration from file
  const importTheme = () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const themeConfig = JSON.parse(e.target?.result as string);
            console.log('Imported theme config:', themeConfig);
            
            // Validate the imported theme
            if (themeConfig.primaryColor && themeConfig.fontFamily) {
              // Update all state variables
              setPrimaryColor(themeConfig.primaryColor || '#3b82f6');
              setSecondaryColor(themeConfig.secondaryColor || '#64748b');
              setBackgroundColor(themeConfig.backgroundColor || '#ffffff');
              setTextColor(themeConfig.textColor || '#374151');
              setFontFamily(themeConfig.fontFamily || 'Inter');
              setFontSize(themeConfig.fontSize || '16px');
              setLayoutStyle(themeConfig.layoutStyle || 'single-column');
              setButtonStyle(themeConfig.buttonStyle || 'rounded');
              setBorderRadius(themeConfig.borderRadius || '8px');
              setAnimationStyle(themeConfig.animationStyle || 'fade');
              
              alert('Theme imported successfully! 🎨\n\nTheme: ' + (themeConfig.name || 'Custom Theme'));
            } else {
              alert('Invalid theme file. Please select a valid quiz theme JSON file.');
            }
          } catch (error) {
            console.error('Failed to parse imported theme:', error);
            alert('Failed to import theme. Invalid JSON file.');
          }
        };
        reader.readAsText(file);
      }
    };
    
    // Trigger file selection
    fileInput.click();
    
    // Clean up
    document.body.appendChild(fileInput);
    setTimeout(() => document.body.removeChild(fileInput), 1000);
  };

  // Check if theme has been modified from defaults
  const isThemeModified = () => {
    return primaryColor !== '#3b82f6' || 
           secondaryColor !== '#64748b' || 
           backgroundColor !== '#ffffff' || 
           textColor !== '#374151' ||
           fontFamily !== 'Inter' ||
           fontSize !== '16px' ||
           layoutStyle !== 'single-column' ||
           buttonStyle !== 'rounded' ||
           borderRadius !== '8px' ||
           animationStyle !== 'fade';
  };

  return (
    <Card>
      <div style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div>
              <Text variant="headingMd" as="h3">
                Theme Manager
              </Text>
                                        <Text variant="bodyMd" as="p" tone="subdued">
                            Customize the look and feel of your quizzes
                            {isThemeModified() && (
                              <span style={{
                                marginLeft: '0.75rem',
                                color: '#059669',
                                fontSize: '1rem',
                                fontWeight: '600',
                                backgroundColor: '#d1fae5',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid #10b981'
                              }}>
                                ✏️ Modified
                              </span>
                            )}
                          </Text>
                          
                          {/* Debug display - shows current theme state */}
                          <div style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: '#374151',
                            fontFamily: 'monospace'
                          }}>
                            <strong>Debug:</strong> Primary: {primaryColor} | Font: {fontFamily} | Layout: {layoutStyle} | Animation: {animationStyle}
                          </div>
            </div>
          </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Button onClick={loadTheme}>
                          Load Theme
                        </Button>
                        <Button onClick={importTheme}>
                          Import Theme
                        </Button>
                        <Button onClick={exportTheme}>
                          Export Theme
                        </Button>
                        <Button onClick={resetToDefaults}>
                          Reset to Defaults
                        </Button>
                        <Button primary onClick={saveTheme}>
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
                        value={primaryColor}
                        onChange={(e) => updatePrimaryColor(e.target.value)}
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
                        value={primaryColor}
                        onChange={(e) => updatePrimaryColor(e.target.value)}
                        placeholder="#3b82f6"
                        style={{
                          padding: '0.5rem',
                          border: `1px solid ${getInputBorderColor(primaryColor)}`,
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
                        value={secondaryColor}
                        onChange={(e) => updateSecondaryColor(e.target.value)}
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
                        value={secondaryColor}
                        onChange={(e) => updateSecondaryColor(e.target.value)}
                        placeholder="#64748b"
                        style={{
                          padding: '0.5rem',
                          border: `1px solid ${getInputBorderColor(secondaryColor)}`,
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
                        value={backgroundColor}
                        onChange={(e) => updateBackgroundColor(e.target.value)}
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
                        value={backgroundColor}
                        onChange={(e) => updateBackgroundColor(e.target.value)}
                        placeholder="#ffffff"
                        style={{
                          padding: '0.5rem',
                          border: `1px solid ${getInputBorderColor(backgroundColor)}`,
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
                        value={textColor}
                        onChange={(e) => updateTextColor(e.target.value)}
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
                        value={textColor}
                        onChange={(e) => updateTextColor(e.target.value)}
                        placeholder="#374151"
                        style={{
                          padding: '0.5rem',
                          border: `1px solid ${getInputBorderColor(textColor)}`,
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
                {/* Debug info - shows current typography state */}
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '0.5rem', 
                  backgroundColor: '#f0f9ff', 
                  border: '1px solid #0ea5e9', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#0369a1'
                }}>
                  <strong>Current Typography:</strong> {fontFamily} | {fontSize}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <Text variant="headingSm" as="h5">Font Family</Text>
                    <Text variant="bodySm" tone="subdued">Choose the main font for your quiz</Text>
                    <select
                      value={fontFamily}
                      onChange={(e) => updateFontFamily(e.target.value)}
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
                      <option value="serif">Serif</option>
                      <option value="monospace">Monospace</option>
                      <option value="cursive">Cursive</option>
                      <option value="fantasy">Fantasy</option>
                    </select>
                  </div>

                  <div>
                    <Text variant="headingSm" as="h5">Font Size</Text>
                    <Text variant="bodySm" tone="subdued">Base font size for the quiz</Text>
                    <input
                      type="text"
                      value={fontSize}
                      onChange={(e) => updateFontSize(e.target.value)}
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
                      <h3 style={{ 
                        fontFamily: `${fontFamily}, system-ui, sans-serif`, 
                        fontSize: fontSize,
                        marginBottom: '1rem',
                        color: primaryColor,
                        margin: '0 0 1rem 0',
                        fontWeight: '600'
                      }}>
                        Sample Heading
                      </h3>
                      <p style={{ 
                        fontFamily: `${fontFamily}, system-ui, sans-serif`, 
                        fontSize: fontSize,
                        lineHeight: '1.5',
                        margin: '0 0 1rem 0'
                      }}>
                        This is how your quiz text will appear with the selected font and size.
                      </p>
                      <p style={{ 
                        fontFamily: `${fontFamily}, system-ui, sans-serif`, 
                        fontSize: fontSize,
                        marginTop: '1rem',
                        color: secondaryColor,
                        fontStyle: 'italic',
                        margin: '1rem 0 0 0',
                        fontSize: '14px'
                      }}>
                        Font: {fontFamily} | Size: {fontSize}
                      </p>
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
                {/* Debug info - shows current layout state */}
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '0.5rem', 
                  backgroundColor: '#fef3c7', 
                  border: '1px solid #f59e0b', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#92400e'
                }}>
                  <strong>Current Layout:</strong> {layoutStyle} | {buttonStyle} | {borderRadius} | {animationStyle}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <Text variant="headingSm" as="h5">Layout Style</Text>
                    <Text variant="bodySm" tone="subdued">Choose how questions are displayed</Text>
                    <select
                      value={layoutStyle}
                      onChange={(e) => updateLayoutStyle(e.target.value)}
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
                      value={buttonStyle}
                      onChange={(e) => updateButtonStyle(e.target.value)}
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
                      value={borderRadius}
                      onChange={(e) => updateBorderRadius(e.target.value)}
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
                      value={animationStyle}
                      onChange={(e) => updateAnimationStyle(e.target.value)}
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
                  backgroundColor: backgroundColor,
                  maxWidth: '500px'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Text variant="headingLg" as="h3" style={{ color: primaryColor, marginBottom: '0.5rem', fontFamily: `${fontFamily}, system-ui, sans-serif`, fontSize: fontSize }}>
                      Sample Quiz Question
                    </Text>
                    <Text variant="bodyMd" as="p" style={{ color: secondaryColor, fontFamily: `${fontFamily}, system-ui, sans-serif`, fontSize: fontSize }}>
                      This is how your quiz will look with the current theme settings.
                    </Text>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <Text variant="headingMd" as="h4" style={{ marginBottom: '1rem', fontFamily: `${fontFamily}, system-ui, sans-serif`, fontSize: fontSize }}>
                      What's your favorite color?
                    </Text>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        style={{
                          padding: '0.75rem 1rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: getButtonBorderRadius(),
                          backgroundColor: backgroundColor,
                          color: textColor,
                          cursor: 'pointer',
                          fontSize: fontSize,
                          fontFamily: `${fontFamily}, system-ui, sans-serif`,
                          ...getAnimationStyles()
                        }}
                        onMouseEnter={(e) => {
                          if (animationStyle === 'fade') {
                            e.currentTarget.style.backgroundColor = primaryColor;
                            e.currentTarget.style.color = backgroundColor;
                          } else if (animationStyle === 'slide') {
                            e.currentTarget.style.transform = 'translateX(10px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (animationStyle === 'fade') {
                            e.currentTarget.style.backgroundColor = backgroundColor;
                            e.currentTarget.style.color = textColor;
                          } else if (animationStyle === 'slide') {
                            e.currentTarget.style.transform = 'translateX(0)';
                          }
                        }}
                      >
                        Blue
                      </button>
                      <button 
                        style={{
                          padding: '0.75rem 1rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: getButtonBorderRadius(),
                          backgroundColor: backgroundColor,
                          color: textColor,
                          cursor: 'pointer',
                          fontSize: fontSize,
                          fontFamily: `${fontFamily}, system-ui, sans-serif`,
                          ...getAnimationStyles()
                        }}
                        onMouseEnter={(e) => {
                          if (animationStyle === 'fade') {
                            e.currentTarget.style.backgroundColor = primaryColor;
                            e.currentTarget.style.color = backgroundColor;
                          } else if (animationStyle === 'slide') {
                            e.currentTarget.style.transform = 'translateX(10px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (animationStyle === 'fade') {
                            e.currentTarget.style.backgroundColor = backgroundColor;
                            e.currentTarget.style.color = textColor;
                          } else if (animationStyle === 'slide') {
                            e.currentTarget.style.transform = 'translateX(0)';
                          }
                        }}
                      >
                        Green
                      </button>
                      <button 
                        style={{
                          padding: '0.75rem 1rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: getButtonBorderRadius(),
                          backgroundColor: backgroundColor,
                          color: textColor,
                          cursor: 'pointer',
                          fontSize: fontSize,
                          fontFamily: `${fontFamily}, system-ui, sans-serif`,
                          ...getAnimationStyles()
                        }}
                        onMouseEnter={(e) => {
                          if (animationStyle === 'fade') {
                            e.currentTarget.style.backgroundColor = primaryColor;
                            e.currentTarget.style.color = backgroundColor;
                          } else if (animationStyle === 'slide') {
                            e.currentTarget.style.transform = 'translateX(10px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (animationStyle === 'fade') {
                            e.currentTarget.style.backgroundColor = backgroundColor;
                            e.currentTarget.style.color = textColor;
                          } else if (animationStyle === 'slide') {
                            e.currentTarget.style.transform = 'translateX(0)';
                          }
                        }}
                      >
                        Red
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button 
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: getButtonBorderRadius(),
                        backgroundColor: primaryColor,
                        color: backgroundColor,
                        cursor: 'pointer',
                        fontSize: fontSize,
                        fontFamily: `${fontFamily}, system-ui, sans-serif`,
                        ...getAnimationStyles()
                      }}
                      onMouseEnter={(e) => {
                        if (animationStyle === 'fade') {
                          e.currentTarget.style.opacity = '0.8';
                        } else if (animationStyle === 'slide') {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (animationStyle === 'fade') {
                          e.currentTarget.style.opacity = '1';
                        } else if (animationStyle === 'slide') {
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
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
