module.exports = {
  displayName: 'shopify-quiz-builder-api',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '<rootDir>/coverage',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
  moduleNameMapper: {
    '^@shopify-quiz-builder/(.*)$': '<rootDir>/../../packages/$1/src',
  },
  // Fix Watchman issues
  watchman: false,
  // Optimize performance
  maxWorkers: '50%',
  // Disable watch mode by default
  watch: false,
  // Increase test timeout
  testTimeout: 30000,

  // Cache test results
  cache: true,
  // Use faster test environment
  testEnvironment: 'node',
  // Performance optimizations
  bail: false,
  verbose: false,
  // Skip slow tests by default
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  // Faster module resolution
  moduleDirectories: ['node_modules'],
  // Reduce file watching overhead
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
};
