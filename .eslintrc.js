module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'prettier'
  ],
  plugins: [
    'prettier'
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // A+ Quality Standards - Error Level Rules
    'prettier/prettier': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'off', // Disabled for build compatibility
    '@typescript-eslint/prefer-optional-chain': 'off', // Disabled for build compatibility
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-unused-expressions': 'error',
    
    // React Rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    
    // Code Quality Rules
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'no-duplicate-imports': 'warn',
    'complexity': 'warn',
    'max-lines-per-function': 'warn',
    'max-params': 'warn',
    'max-depth': ['error', 4],
    'max-nested-callbacks': 'warn',
    
    // Performance Rules
    'no-loop-func': 'error',
    'no-inner-declarations': 'error',
    
    // Security Rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error'
  },
  overrides: [
    {
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
        'max-lines-per-function': 'off',
        'complexity': 'off',
        'max-nested-callbacks': 'off'
      }
    },
    {
      // Allow console.log in specific development files
      files: [
        'src/App.tsx',
        'src/stores/migration.ts',
        'src/utils/security.ts',
        'src/utils/performanceMonitor.ts'
      ],
      rules: {
        'no-console': [
          'warn',
          {
            allow: ['warn', 'error', 'log']
          }
        ]
      }
    },
    {
      // Netlify functions have different requirements
      files: ['netlify/functions/**/*.ts'],
      rules: {
        'no-console': [
          'warn',
          {
            allow: ['warn', 'error', 'log']
          }
        ],
        'max-lines-per-function': ['error', 100]
      }
    },
    {
      // Build environment compatibility
      files: ['src/**/*.js', 'src/**/*.jsx'],
      rules: {
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      }
    }
  ]
};
