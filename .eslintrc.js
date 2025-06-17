import tseslint from 'typescript-eslint';
import js from '@eslint/js';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintImport from 'eslint-plugin-import';

export default tseslint.config(
    { ignores: ['dist'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{js,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'import': eslintImport,
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            'import/first': 'warn',
            'import/no-duplicates': 'warn',
            'simple-import-sort/imports': 'warn',
            'simple-import-sort/exports': 'warn',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/interface-name-prefix': 'off',
        }
    },
);