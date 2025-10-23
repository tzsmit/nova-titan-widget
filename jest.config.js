/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/frontend/src/setupTests.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/frontend/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }],
    '^.+\\.jsx?$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react'] }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: [
    '<rootDir>/frontend/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/frontend/src/**/?(*.)(spec|test).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'frontend/src/**/*.(ts|tsx)',
    '!frontend/src/**/*.d.ts',
    '!frontend/src/main.tsx',
    '!frontend/src/setupTests.ts',
    '!frontend/src/**/__tests__/**',
    '!frontend/src/**/*.stories.(ts|tsx)',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 10000,
  verbose: true,
};