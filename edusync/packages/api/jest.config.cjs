/**
 * Jest Configuration for @edusync/api
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/tests/'],
  
  moduleNameMapper: {
    '^@edusync/db$': '<rootDir>/../db/src/nexus-connector',
    '^@edusync/shared$': '<rootDir>/../shared/index',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true,
    }],
  },
};
