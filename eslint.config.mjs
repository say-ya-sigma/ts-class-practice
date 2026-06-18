// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // グローバル無視
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  // ベース推奨ルール (JS)
  js.configs.recommended,

  // TypeScript 推奨ルール（型チェック不要なもの・全 .ts/.tsx へ）
  ...tseslint.configs.recommended,

  // 型情報が必要なルール (src 配下の TS のみ)
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['src/**/*.ts'],
  })),
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // プロジェクト固有の調整
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // 学習用のため console は許可
      'no-console': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // サンプルコードで any を完全禁止すると学習の余地が減るので warn
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
    },
  },

  // テストファイル用の緩和
  {
    files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },

  // 設定ファイル用の緩和 (型情報なしの .mjs/.ts)
  {
    files: ['*.config.{js,mjs,ts}', 'eslint.config.mjs', '.prettierrc.mjs'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // 手書きの教学用 .d.ts (types/api.d.ts) は declare 例の集合なので
  // unused / any / 空オブジェクト型 を許容
  {
    files: ['types/**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-types': 'off',
    },
  },

  // Prettier と競合するルールを無効化（最後に配置）
  prettier,
);
