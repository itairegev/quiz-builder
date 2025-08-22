# Development Guide

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Package manager (recommended over npm)
- **PostgreSQL**: Version 13 or higher
- **Git**: Version control system
- **VS Code**: Recommended editor with extensions

### Required VS Code Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-git-graph",
    "ms-vscode.vscode-docker"
  ]
}
```

## Project Structure

```
peronalizer/
├── apps/
│   ├── api/                    # NestJS backend application
│   │   ├── src/
│   │   │   ├── auth/          # Authentication & authorization
│   │   │   ├── common/        # Shared utilities & middleware
│   │   │   ├── database/      # Database configuration
│   │   │   ├── health/        # Health check endpoints
│   │   │   ├── monitoring/    # Metrics & monitoring
│   │   │   ├── shopify/       # Shopify integration
│   │   │   └── test/          # Integration tests
│   │   ├── __tests__/         # Unit tests
│   │   └── package.json
│   └── web/                   # React frontend (future)
├── packages/
│   ├── common/                # Shared utilities & services
│   │   ├── src/
│   │   │   ├── logger/        # Logging service
│   │   │   ├── monitoring/    # Monitoring service
│   │   │   └── types/         # Shared TypeScript types
│   │   └── package.json
│   └── database/              # Database package
│       ├── prisma/            # Prisma schema & migrations
│       └── package.json
├── docs/                      # Documentation
├── .github/                   # GitHub workflows
├── .vscode/                   # VS Code settings
├── package.json               # Root package.json
└── README.md
```

## Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd peronalizer
```

### 2. Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install workspace dependencies
pnpm install --recursive
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/shopify_quiz_builder"

# Shopify
SHOPIFY_API_KEY="your_shopify_api_key"
SHOPIFY_API_SECRET="your_shopify_api_secret"
SHOPIFY_SCOPES="read_products,write_customers,read_orders"
SHOPIFY_WEBHOOK_SECRET="your_webhook_secret"

# App
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# JWT
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed
```

### 5. Start Development Servers

```bash
# Start backend only
pnpm dev:api

# Start frontend only (future)
pnpm dev:web

# Start both
pnpm dev
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### 2. Testing

```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test -- --testPathPattern=shopify

# Run tests with coverage
pnpm test:cov

# Run tests in watch mode
pnpm test:watch
```

### 3. Code Quality

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Check types
pnpm type-check

# Run all quality checks
pnpm quality
```

## Architecture Patterns

### 1. Service Layer Pattern

All business logic is encapsulated in service classes:

```typescript
@Injectable()
export class QuizService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopifyService: ShopifyService,
  ) {}

  async createQuiz(data: CreateQuizDto): Promise<Quiz> {
    // Business logic here
    return this.prisma.quiz.create({ data });
  }
}
```

### 2. Repository Pattern

Database operations are abstracted through Prisma:

```typescript
// In service
const quiz = await this.prisma.quiz.findUnique({
  where: { id: quizId },
  include: { questions: true }
});
```

### 3. DTO Pattern

Data transfer objects for input validation:

```typescript
export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(QuizType)
  type: QuizType;
}
```

### 4. Exception Filter Pattern

Global exception handling with custom error types:

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Centralized error handling
  }
}
```

## Testing Strategy

### 1. Unit Tests

Test individual components in isolation:

```typescript
describe('QuizService', () => {
  let service: QuizService;
  let mockPrisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: PrismaService, useValue: mockPrisma }
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  it('should create quiz successfully', async () => {
    const dto = { title: 'Test Quiz', type: QuizType.GUIDED };
    const expected = { id: 'quiz_1', ...dto };

    mockPrisma.quiz.create.mockResolvedValue(expected);
    const result = await service.createQuiz(dto);

    expect(result).toEqual(expected);
    expect(mockPrisma.quiz.create).toHaveBeenCalledWith({ data: dto });
  });
});
```

### 2. Integration Tests

Test component interactions:

```typescript
describe('Quiz Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.quiz.deleteMany();
  });

  it('should create and retrieve quiz', async () => {
    // Test full flow
  });
});
```

### 3. E2E Tests

Test complete user workflows:

```typescript
describe('Quiz E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should complete quiz workflow', async () => {
    // Test complete user journey
  });
});
```

## Error Handling

### 1. Custom Exceptions

Create domain-specific exceptions:

```typescript
export class QuizNotFoundException extends BaseException {
  constructor(quizId: string, requestId?: string) {
    super(
      `Quiz with ID '${quizId}' not found`,
      404,
      'QUIZ_NOT_FOUND',
      { quizId },
      requestId
    );
  }
}
```

### 2. Exception Filter

Global exception handling:

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof BaseException) {
      // Handle custom exceptions
      return this.handleCustomException(exception, response, request);
    }

    // Handle other exceptions
    return this.handleGenericException(exception, response, request);
  }
}
```

### 3. Error Response Format

Consistent error responses:

```json
{
  "statusCode": 404,
  "message": "Quiz not found",
  "error": "QUIZ_NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/quizzes/123",
  "requestId": "req_123456789",
  "details": {
    "quizId": "123"
  }
}
```

## Logging & Monitoring

### 1. Structured Logging

Use Winston for structured logging:

```typescript
@Injectable()
export class LoggerService {
  private readonly logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
  });

  log(message: string, meta?: any) {
    this.logger.info(message, meta);
  }
}
```

### 2. Performance Monitoring

Track API performance:

```typescript
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.monitoringService.recordMetric('api_response_time', duration, {
          path: request.url,
          method: request.method
        });
      })
    );
  }
}
```

### 3. Health Checks

Monitor system health:

```typescript
@Injectable()
export class HealthCheckService {
  async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: { status: 'up' } };
    } catch (error) {
      return { database: { status: 'down', error: error.message } };
    }
  }
}
```

## Database Management

### 1. Prisma Schema

Define data models:

```prisma
model Quiz {
  id          String   @id @default(cuid())
  title       String
  description String?
  type        QuizType
  status      QuizStatus @default(DRAFT)
  shopId      String
  shop        Shop     @relation(fields: [shopId], references: [id])
  questions   Question[]
  responses   QuizResponse[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("quizzes")
}
```

### 2. Migrations

Manage database schema changes:

```bash
# Create migration
pnpm db:migrate:dev --name add_quiz_settings

# Apply migrations
pnpm db:migrate:deploy

# Reset database
pnpm db:reset
```

### 3. Seeding

Populate database with test data:

```typescript
// prisma/seed.ts
async function main() {
  const shop = await prisma.shop.create({
    data: {
      shopifyDomain: 'test.myshopify.com',
      accessToken: 'test-token',
      scope: 'read_products,write_customers'
    }
  });

  await prisma.quiz.create({
    data: {
      title: 'Test Quiz',
      type: 'GUIDED',
      shopId: shop.id
    }
  });
}
```

## API Development

### 1. Controller Structure

Organize endpoints logically:

```typescript
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @UseGuards(ShopifyAuthGuard)
  async createQuiz(@Body() dto: CreateQuizDto, @Req() req: Request) {
    return this.quizService.createQuiz(dto, req.shop);
  }

  @Get()
  @UseGuards(ShopifyAuthGuard)
  async getQuizzes(@Query() query: GetQuizzesDto, @Req() req: Request) {
    return this.quizService.getQuizzes(query, req.shop);
  }
}
```

### 2. Validation

Use class-validator for input validation:

```typescript
export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(QuizType)
  type: QuizType;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => QuizSettingsDto)
  settings?: QuizSettingsDto;
}
```

### 3. Response Transformation

Use interceptors for consistent responses:

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        data,
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: 'Success',
        timestamp: new Date().toISOString(),
        path: context.switchToHttp().getRequest().url,
        requestId: context.switchToHttp().getRequest().requestId
      }))
    );
  }
}
```

## Security Best Practices

### 1. Authentication

Implement proper authentication:

```typescript
@Injectable()
export class ShopifyAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const shopDomain = request.headers['x-shopify-shop-domain'];
    const authHeader = request.headers.authorization;

    if (!shopDomain || !authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Shopify authentication required');
    }

    // Validate token and shop
    return true;
  }
}
```

### 2. Input Validation

Validate all inputs:

```typescript
@Post()
@UsePipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true
}))
async createQuiz(@Body() dto: CreateQuizDto) {
  return this.quizService.createQuiz(dto);
}
```

### 3. Rate Limiting

Implement rate limiting:

```typescript
@Injectable()
export class RateLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = `rate_limit:${request.ip}`;
    
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, 60);
    }
    
    if (current > 100) {
      throw new ThrottlerException('Rate limit exceeded');
    }
    
    return true;
  }
}
```

## Performance Optimization

### 1. Database Optimization

Use efficient queries:

```typescript
// Good: Select only needed fields
const quizzes = await this.prisma.quiz.findMany({
  where: { shopId, status: 'PUBLISHED' },
  select: {
    id: true,
    title: true,
    type: true,
    _count: { select: { questions: true } }
  }
});

// Avoid: Select all fields
const quizzes = await this.prisma.quiz.findMany({
  where: { shopId, status: 'PUBLISHED' }
});
```

### 2. Caching

Implement caching strategies:

```typescript
@Injectable()
export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}
```

### 3. Pagination

Implement efficient pagination:

```typescript
export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// In service
async getQuizzes(query: PaginationDto, shopId: string) {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const [quizzes, total] = await Promise.all([
    this.prisma.quiz.findMany({
      where: { shopId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    this.prisma.quiz.count({ where: { shopId } })
  ]);

  return {
    quizzes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
```

## Deployment

### 1. Environment Configuration

Use environment-specific configs:

```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    url: process.env.DATABASE_URL,
  },
  shopify: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SHOPIFY_SCOPES?.split(',') || [],
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});
```

### 2. Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start:prod"]
```

### 3. Health Checks

Implement health check endpoints:

```typescript
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return this.healthCheckService.checkSystemHealth();
  }

  @Get('ready')
  async ready() {
    return this.healthCheckService.checkReadiness();
  }

  @Get('live')
  async live() {
    return this.healthCheckService.checkLiveness();
  }
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check network connectivity

2. **Shopify API Errors**
   - Verify API credentials
   - Check API version compatibility
   - Monitor rate limits

3. **Test Failures**
   - Clear Jest cache: `pnpm test --clearCache`
   - Check test database connection
   - Verify mock configurations

### Debug Mode

Enable debug logging:

```typescript
// Set log level
this.logger.setLogLevel('debug');

// Enable request logging
app.use(morgan('dev'));
```

### Performance Profiling

Use built-in profiling:

```typescript
// Enable performance monitoring
app.use(compression());
app.use(helmet());

// Monitor response times
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
```

## Contributing

### Code Standards

1. **TypeScript**: Use strict mode and proper typing
2. **ESLint**: Follow configured linting rules
3. **Prettier**: Use consistent code formatting
4. **Testing**: Maintain high test coverage
5. **Documentation**: Document all public APIs

### Pull Request Process

1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Ensure all tests pass
5. Create pull request with description
6. Address review feedback
7. Merge after approval

### Commit Messages

Use conventional commit format:

```
feat: add new quiz creation endpoint
fix: resolve rate limiting issue
docs: update API documentation
test: add integration tests for quiz service
refactor: improve error handling
```

---

*Last updated: January 15, 2024*  
*Version: 1.0.0*
