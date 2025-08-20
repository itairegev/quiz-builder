import { ConfigModule } from '@nestjs/config';

// Global test configuration
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.SHOPIFY_API_KEY = 'test-api-key';
  process.env.SHOPIFY_API_SECRET = 'test-api-secret';
  process.env.SHOPIFY_SCOPES = 'read_products,write_products';
  process.env.SHOPIFY_WEBHOOK_SECRET = 'test-webhook-secret';
  process.env.SHOPIFY_APP_URL = 'https://test-app.com';
});

// Global test cleanup
afterAll(async () => {
  // Clean up any global test state
});

// Global test timeout
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
