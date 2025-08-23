# Development Guide

## Overview

This guide provides comprehensive development instructions for the Shopify Quiz Builder application. It covers setup, architecture, development workflows, and best practices.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Environment](#development-environment)
4. [Frontend Development](#frontend-development)
5. [Backend Development](#backend-development)
6. [Testing](#testing)
7. [Deployment](#deployment)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/shopify-quiz-builder.git
cd shopify-quiz-builder

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

## Project Structure

```
peronalizer/
├── apps/
│   ├── admin/          # Next.js admin dashboard
│   ├── api/            # NestJS backend API
│   └── storefront/     # Shopify storefront app
├── packages/
│   ├── common/         # Shared utilities
│   ├── database/       # Database models and migrations
│   └── ui/             # Shared UI components
├── docs/               # Documentation
└── scripts/            # Development and deployment scripts
```

## Development Environment

### Backend (NestJS)

```bash
cd apps/api
npm run start:dev
```

### Frontend (Next.js Admin)

```bash
cd apps/admin
npm run dev
```

### Database

```bash
cd packages/database
npm run db:generate
npm run db:push
```

## Frontend Development

### QuizPreview Component

The QuizPreview component is a comprehensive dashboard interface for managing quiz previews, validation, and embed codes.

#### Component Structure

```typescript
// apps/admin/src/components/QuizPreview.tsx
export default function QuizPreview() {
  const [selectedQuizId, setSelectedQuizId] = useState('test-quiz');
  const [activeTab, setActiveTab] = useState(0);
  
  // Component implementation...
}
```

#### Key Features

- **Interactive Tabs**: Preview, Validation, Embed Codes, and Summary
- **Quiz Selection**: Input field for quiz ID with load functionality
- **Real-time Data**: Dynamic content based on selected quiz
- **Copy to Clipboard**: Functionality for embed codes and URLs
- **Responsive Design**: Works across different screen sizes

#### Implementation Details

##### Tab System
```typescript
const tabs = [
  { id: 'preview', content: 'Preview' },
  { id: 'validation', content: 'Validation' },
  { id: 'embed', content: 'Embed Codes' },
  { id: 'summary', content: 'Summary' },
];

<Tabs tabs={tabs} selected={activeTab} onSelect={setActiveTab}>
  {/* Tab content */}
</Tabs>
```

##### Data Display
```typescript
{activeTab === 0 && (
  <div style={{ padding: '1rem 0' }}>
    <Text variant="headingMd" as="h4">
      Test Quiz Preview
    </Text>
    <Text variant="bodySm" as="p" tone="subdued">
      ID: {selectedQuizId}
    </Text>
    {/* More content */}
  </div>
)}
```

#### Polaris Integration

The component uses Shopify Polaris components for consistent design:

```typescript
import { 
  Card, 
  Text, 
  Button, 
  Tabs,
  Badge
} from '@shopify/polaris';
```

#### Styling Approach

- **Inline Styles**: Used for layout and spacing
- **Polaris Components**: For consistent design patterns
- **Responsive Design**: CSS Grid and Flexbox for layouts
- **Custom Styling**: Minimal custom CSS for specific needs

#### State Management

```typescript
const [selectedQuizId, setSelectedQuizId] = useState('test-quiz');
const [activeTab, setActiveTab] = useState(0);

// Quiz selection handler
const handleQuizLoad = () => {
  console.log('Load quiz:', selectedQuizId);
  // API call implementation
};
```

#### Error Handling

```typescript
// Input validation
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
```

#### Testing the Component

1. **Start the development server**:
   ```bash
   cd apps/admin
   npm run dev
   ```

2. **Navigate to the dashboard**:
   - Open `http://localhost:3000`
   - Look for the "Quiz Preview" section

3. **Test functionality**:
   - Switch between tabs
   - Enter different quiz IDs
   - Test copy to clipboard functionality
   - Verify responsive design

#### Integration with Dashboard

The QuizPreview component is integrated into the main dashboard:

```typescript
// apps/admin/src/app/page.tsx
<Layout.Section>
  <QuizPreview />
</Layout.Section>
```

### Component Best Practices

1. **Use Polaris Components**: Maintain consistency with Shopify design
2. **Responsive Design**: Ensure mobile compatibility
3. **Error Boundaries**: Handle component failures gracefully
4. **Performance**: Use React.memo for expensive components
5. **Accessibility**: Include proper ARIA labels and keyboard navigation

---
