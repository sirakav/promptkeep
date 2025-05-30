module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Specific mock for the re-exporting module
    '^@/components/ui/dialog$': '<rootDir>/__mocks__/components/ui/dialog.js', 
    // Generic alias for other components (should come after specific ones if order matters for Jest's resolution)
    '^@/components/(.*)$': '<rootDir>/src/components/$1', 
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@radix-ui/react-dialog$': '<rootDir>/__mocks__/@radix-ui/react-dialog.js', // Keep existing
    '^@radix-ui/react-slot$': '<rootDir>/__mocks__/@radix-ui/react-slot.js', // New mock
    '^lucide-react$': '<rootDir>/__mocks__/lucide-react.js', // Keep existing
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: true,
          dynamicImport: true,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
      module: {
        type: 'commonjs',
      }
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@radix-ui|lucide-react)/)', // Ensure Radix UI and lucide-react are transformed
  ],
  clearMocks: true,
};
