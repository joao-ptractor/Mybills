import { nestJsConfig } from '@mybills/eslint-config/nest';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nestJsConfig,
  {
    ignores: ['.prettierrc.mjs', 'eslint.config.mjs']
  }
];
