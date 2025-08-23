# Shopify Quiz Builder

A comprehensive quiz building platform integrated with Shopify, featuring advanced error handling, logging, monitoring, GraphQL API integration, and an interactive admin dashboard.

## 🚀 Features

### Core Functionality
- **Quiz Management**: Create, manage, and deploy interactive quizzes
- **Quiz Builder Interface**: Drag-and-drop quiz creation with templates and validation
- **QuizPreview Dashboard**: Interactive admin interface for quiz preview, validation, and embed codes
- **Shopify Integration**: Seamless integration with Shopify stores
- **Real-time Analytics**: Track quiz performance and user engagement
- **Customizable Templates**: Pre-built quiz templates for various use cases
- **Webhook System**: Real-time Shopify integration with event processing

### Technical Features
- **Advanced Error Handling**: Comprehensive exception management with custom error types
- **Structured Logging**: Winston-based logging with request tracing and performance monitoring
- **Health Monitoring**: System health checks and external service monitoring
- **Shopify GraphQL Client**: Robust GraphQL client with rate limiting, retry logic, and error handling
- **Shopify Webhooks**: HMAC-validated webhook handling with event logging and processing
- **Quiz Builder API**: Comprehensive builder endpoints with template system and validation
- **QuizPreview API**: Complete preview, validation, and embed code generation system
- **Performance Metrics**: Request/response timing and business metrics collection
- **Security**: Shopify authentication guards and webhook signature validation

## 🏗️ Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Shopify OAuth integration
- **API**: RESTful API with GraphQL client for Shopify operations
- **Testing**: Jest with comprehensive test coverage

### Frontend (Next.js Admin)
- **Framework**: Next.js 14 with TypeScript
- **UI Components**: Shopify Polaris design system
- **State Management**: React hooks for local state
- **Styling**: Polaris components with custom CSS for layouts
- **Dashboard**: Interactive QuizPreview component with tabs and real-time data

### Frontend (React Storefront)
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state
- **Routing**: React Router for navigation

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- Shopify Partner account
- npm or yarn package manager

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd peronalizer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
cd packages/database
npm run db:generate
npm run db:push

# Start development servers
npm run dev
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shopify_quiz_builder"

# Shopify
SHOPIFY_API_KEY="your_shopify_api_key"
SHOPIFY_API_SECRET="your_shopify_api_secret"
SHOPIFY_SCOPES="read_products,write_customers,read_orders"
SHOPIFY_WEBHOOK_SECRET="your_webhook_secret"

# App
NODE_ENV="development"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

## 🧪 Testing

### Current Test Status
- **Total Tests**: 199
- **Passing**: 173 (87%)
- **Failing**: 26 (13% - core-api integration tests need auth middleware fixes)

### Current System Status
- **API Server**: ✅ Running on http://localhost:4000
- **Admin Interface**: ✅ Fully functional on http://localhost:3000 with Shopify Polaris
- **QuizPreview Dashboard**: ✅ Interactive component with tabs, validation, and embed codes
- **Storefront**: ✅ Running on http://localhost:5173
- **All Interfaces**: ✅ Working correctly with React compatibility issues resolved

## 🎯 QuizPreview Dashboard

The QuizPreview dashboard provides a comprehensive interface for managing quiz previews, validation, and embed codes.

### Features
- **Interactive Tabs**: Preview, Validation, Embed Codes, and Summary
- **Quiz Selection**: Input field for quiz ID with load functionality
- **Real-time Data**: Dynamic content based on selected quiz
- **Copy to Clipboard**: Functionality for embed codes and URLs
- **Responsive Design**: Works across different screen sizes
- **Professional UI**: Clean, modern interface following Shopify design patterns

### Dashboard Sections
- **Preview Tab**: Quiz information, ID, message, and timestamp
- **Validation Tab**: Configuration status, warnings, and improvement suggestions
- **Embed Codes Tab**: Iframe, JavaScript, and CSS embed codes with copy functionality
- **Summary Tab**: Quiz statistics, metrics, and preview URL

### Technical Implementation
- Built with React hooks (useState, useEffect)
- Integrated with Shopify Polaris component library
- Proper TypeScript interfaces for all data structures
- Responsive CSS Grid and Flexbox layouts
- Error handling and loading states
- Console logging for development debugging

---
