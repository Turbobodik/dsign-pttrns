module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'no-console': 'off',
    'max-len': ['error', { code: 120 }],
    'linebreak-style': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
  },
  ignorePatterns: ['dist', 'node_modules', 'coverage', 'logs'],
};
