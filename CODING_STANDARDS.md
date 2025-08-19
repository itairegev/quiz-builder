# Coding Standards

This document outlines the coding standards and best practices for the Shopify Quiz Builder project.

## Code Style

### General Principles

- **Readability**: Code should be self-documenting and easy to understand
- **Consistency**: Follow established patterns and conventions
- **Maintainability**: Write code that's easy to modify and extend
- **Performance**: Consider performance implications of your code
- **Security**: Always validate input and handle errors securely

### Naming Conventions

#### Files and Directories
- Use **kebab-case** for file and directory names
- Examples: `quiz-builder.tsx`, `user-authentication.ts`, `components/`

#### Variables and Functions
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes, interfaces, and type names
- Use **UPPER_SNAKE_CASE** for constants

```typescript
// ✅ Good
const quizBuilder = new QuizBuilder();
const userAuthenticationService = new UserAuthenticationService();
const MAX_RETRY_ATTEMPTS = 3;

// ❌ Bad
const quiz_builder = new QuizBuilder();
const UserAuthenticationService = new UserAuthenticationService();
const maxRetryAttempts = 3;
```

#### React Components
- Use **PascalCase** for component names
- Match the filename to the component name

```typescript
// QuizBuilder.tsx
export const QuizBuilder: React.FC = () => {
  // Component implementation
};
```

### TypeScript

#### Type Definitions
- Always define types for function parameters and return values
- Use interfaces for object shapes
- Prefer union types over `any`

```typescript
// ✅ Good
interface QuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

function createQuestion(question: QuizQuestion): Promise<QuizQuestion> {
  // Implementation
}

// ❌ Bad
function createQuestion(question: any): any {
  // Implementation
}
```

#### Null Safety
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Avoid `!` operator unless absolutely necessary
- Handle undefined/null cases explicitly

```typescript
// ✅ Good
const questionText = question?.text ?? 'No question text';
const userName = user?.profile?.name || 'Anonymous';

// ❌ Bad
const questionText = question!.text;
const userName = user.profile.name;
```

### React Best Practices

#### Component Structure
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

```typescript
// ✅ Good
export const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onSave }) => {
  const { formData, handleSubmit, isLoading } = useQuestionForm(question);
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
};

// ❌ Bad
export class QuestionEditor extends React.Component {
  // Class component with complex state management
}
```

#### State Management
- Use local state for component-specific data
- Use Zustand for shared application state
- Avoid prop drilling - use context or state management

#### Performance
- Use `React.memo` for expensive components
- Use `useCallback` and `useMemo` sparingly
- Avoid creating objects/functions in render

### Error Handling

#### Try-Catch Blocks
- Always handle errors gracefully
- Log errors for debugging
- Provide user-friendly error messages

```typescript
// ✅ Good
try {
  const result = await apiCall();
  return result;
} catch (error) {
  logger.error('API call failed', { error, context: 'quiz-creation' });
  throw new UserFriendlyError('Failed to create quiz. Please try again.');
}

// ❌ Bad
const result = await apiCall();
return result;
```

#### API Error Handling
- Handle different HTTP status codes appropriately
- Provide fallback values for failed requests
- Implement retry logic for transient failures

### Testing

#### Test Structure
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Test both success and failure scenarios

```typescript
// ✅ Good
describe('QuizBuilder', () => {
  it('should create a new quiz with valid data', async () => {
    // Arrange
    const quizData = createMockQuizData();
    const mockApi = createMockApi();
    
    // Act
    const result = await quizBuilder.create(quizData);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.title).toBe(quizData.title);
  });
  
  it('should throw error when quiz data is invalid', async () => {
    // Arrange
    const invalidData = createInvalidQuizData();
    
    // Act & Assert
    await expect(quizBuilder.create(invalidData))
      .rejects.toThrow('Invalid quiz data');
  });
});
```

#### Test Coverage
- Aim for at least 80% code coverage
- Focus on critical business logic
- Test edge cases and error conditions

### Documentation

#### Code Comments
- Comment complex business logic
- Explain "why" not "what"
- Keep comments up-to-date with code changes

```typescript
// ✅ Good
// Skip validation for admin users to allow bulk operations
if (user.role === 'admin' && isBulkOperation) {
  return true;
}

// ❌ Bad
// Check if user is admin
if (user.role === 'admin' && isBulkOperation) {
  return true;
}
```

#### JSDoc Comments
- Use JSDoc for public APIs and complex functions
- Include parameter types and return types
- Provide usage examples for complex functions

```typescript
/**
 * Creates a new quiz with the specified configuration
 * @param config - Quiz configuration object
 * @param options - Additional options for quiz creation
 * @returns Promise resolving to the created quiz
 * @throws {ValidationError} When quiz configuration is invalid
 * @example
 * const quiz = await createQuiz({
 *   title: 'Personality Test',
 *   questions: questionList
 * });
 */
async function createQuiz(config: QuizConfig, options?: QuizOptions): Promise<Quiz> {
  // Implementation
}
```

### Git and Commits

#### Commit Messages
- Use conventional commit format
- Keep subject line under 72 characters
- Use imperative mood ("add" not "added")

```bash
# ✅ Good
feat: add quiz template library
fix: resolve authentication token refresh issue
docs: update API documentation

# ❌ Bad
Added quiz template library
Fixed authentication token refresh issue
Updated API documentation
```

#### Branch Naming
- Use descriptive branch names
- Include task number when applicable
- Use kebab-case

```bash
# ✅ Good
feature/task-15-quiz-templates
bugfix/authentication-token-issue
hotfix/critical-security-patch

# ❌ Bad
feature/quizTemplates
bugfix/auth
hotfix/security
```

### Performance Guidelines

#### Bundle Size
- Keep dependencies minimal
- Use tree shaking effectively
- Monitor bundle size in CI/CD

#### Database Queries
- Use indexes for frequently queried fields
- Avoid N+1 query problems
- Use pagination for large datasets

#### API Design
- Implement proper caching strategies
- Use pagination for list endpoints
- Consider GraphQL for complex data requirements

### Security Guidelines

#### Input Validation
- Always validate and sanitize user input
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization

#### Environment Variables
- Never commit sensitive data to version control
- Use environment variables for configuration
- Validate environment variables at startup

### Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows established patterns
- [ ] All tests pass
- [ ] Code is properly formatted
- [ ] No console.log statements remain
- [ ] Error handling is implemented
- [ ] Documentation is updated
- [ ] Performance implications are considered
- [ ] Security best practices are followed

### Tools and Automation

#### Pre-commit Hooks
- ESLint for code quality
- Prettier for code formatting
- TypeScript for type checking
- Commitlint for commit message validation

#### CI/CD Pipeline
- Automated testing
- Code quality checks
- Security scanning
- Bundle size analysis

## Getting Help

If you have questions about coding standards:

1. Check this document first
2. Review existing code for examples
3. Ask in team discussions
4. Create an issue for clarification

Remember: **Consistency is more important than perfection**. When in doubt, follow the existing patterns in the codebase.
