# API Reference

## Overview

This document provides comprehensive API reference for the Shopify Quiz Builder application. The API is built using NestJS and follows RESTful principles.

## Base URL

- **Development**: `http://localhost:4000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Quiz Preview System

The Quiz Preview system provides comprehensive functionality for previewing, validating, and embedding quizzes.

### Quiz Preview Endpoints

#### Get Quiz Preview Data

```http
GET /quiz-preview/quizzes/{id}
```

**Description**: Retrieves comprehensive preview data for a specific quiz.

**Parameters**:
- `id` (path): Quiz identifier

**Response**:
```json
{
  "data": {
    "id": "quiz-123",
    "title": "Product Recommendation Quiz",
    "message": "Quiz preview data retrieved successfully",
    "timestamp": "2025-08-22T20:58:29.000Z"
  }
}
```

#### Validate Quiz Configuration

```http
POST /quiz-preview/quizzes/{id}/validate
```

**Description**: Validates quiz configuration and provides feedback on errors, warnings, and suggestions.

**Parameters**:
- `id` (path): Quiz identifier

**Response**:
```json
{
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": [
      {
        "field": "theme",
        "message": "Consider adding more theme customization",
        "suggestion": "Add custom colors and fonts"
      }
    ],
    "suggestions": [
      "Add custom theme to match your brand",
      "Enable progress bar to improve user experience"
    ]
  }
}
```

#### Get Embed Codes

```http
GET /quiz-preview/quizzes/{id}/embed
```

**Description**: Retrieves embed codes and customization options for integrating the quiz into external websites.

**Parameters**:
- `id` (path): Quiz identifier

**Response**:
```json
{
  "data": {
    "iframeCode": "<iframe src=\"http://localhost:3000/quiz-preview/quiz-123\" width=\"100%\" height=\"600px\" frameborder=\"0\"></iframe>",
    "scriptCode": "<script src=\"http://localhost:3000/quiz-embed.js\" data-quiz-id=\"quiz-123\"></script>",
    "cssCode": "<link rel=\"stylesheet\" href=\"http://localhost:3000/quiz-styles.css\">",
    "customizationOptions": [
      "Customize width and height",
      "Add custom CSS classes",
      "Modify border and shadow",
      "Change background color"
    ]
  }
}
```

#### Get Quiz Summary

```http
GET /quiz-preview/quizzes/{id}/summary
```

**Description**: Retrieves a lightweight summary of quiz configuration and metadata.

**Parameters**:
- `id` (path): Quiz identifier

**Response**:
```json
{
  "data": {
    "id": "quiz-123",
    "title": "Product Recommendation Quiz",
    "totalQuestions": 5,
    "requiredQuestions": 3,
    "estimatedTime": 3,
    "previewUrl": "http://localhost:3000/quiz-preview/quiz-123",
    "hasLogicRules": true,
    "hasCustomTheme": false
  }
}
```

#### Health Check

```http
GET /quiz-preview/health
```

**Description**: Checks the health status of the quiz preview service.

**Response**:
```json
{
  "data": "Quiz preview service is healthy"
}
```

### Data Transfer Objects (DTOs)

#### PreviewValidationResultDto

```typescript
interface PreviewValidationResultDto {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

interface ValidationError {
  type: 'critical' | 'error' | 'warning';
  field: string;
  message: string;
  questionId?: string;
  ruleId?: string;
}

interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
  questionId?: string;
  ruleId?: string;
}
```

#### EmbedCodeDataDto

```typescript
interface EmbedCodeDataDto {
  iframeCode: string;
  scriptCode: string;
  cssCode: string;
  customizationOptions: string[];
}
```

#### QuizPreviewSummaryDto

```typescript
interface QuizPreviewSummaryDto {
  id: string;
  title: string;
  totalQuestions: number;
  requiredQuestions: number;
  estimatedTime: number;
  previewUrl: string;
  hasLogicRules: boolean;
  hasCustomTheme: boolean;
}
```

---
