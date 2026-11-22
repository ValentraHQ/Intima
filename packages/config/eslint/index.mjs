import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { intimaPlugin } from './boundaries.mjs';

/**
 * Shared flat config. Usage in a workspace:
 *   import { intimaConfig } from '@intima/config/eslint';
 *   export default intimaConfig(import.meta.dirname);
 */
export function intimaConfig(tsconfigRootDir) {
  return tseslint.config(
    { ignores: ['dist/**', 'coverage/**', '.turbo/**', '.next/**', 'eslint.config.mjs'] },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    {
      languageOptions: {
        globals: { ...globals.node },
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      plugins: { intima: intimaPlugin },
      rules: {
        'intima/module-boundaries': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        'no-console': 'error',
      },
    },
    {
      files: ['**/*.mjs', '**/*.js'],
      ...tseslint.configs.disableTypeChecked,
    },
  );
}
