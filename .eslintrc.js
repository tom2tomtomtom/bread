module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'prettier'
  ],
  plugins: [
    'prettier'
  ],
  rules: {
    // A+ Quality Standards - Error Level Rules
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
    
    // React Rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    
    // Code Quality Rules
    'no-console': [
      'error',
      {
        allow: ['warn', 'error']
      }
    ],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'no-duplicate-imports': 'error',
    'complexity': ['error', 10],
    'max-lines-per-function': ['error', 50],
    'max-params': ['error', 5],
    'max-depth': ['error', 4],
    'max-nested-callbacks': ['error', 3],
    
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
    }
  ]
};
