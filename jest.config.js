module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/js/**/*.test.js',
    '**/js/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.test.js',
    '!js/**/*.spec.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: [],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  verbose: true,
  testTimeout: 10000
}; 