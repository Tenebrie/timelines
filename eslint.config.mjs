import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'
import muiPathImports from 'eslint-plugin-mui-path-imports'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

import noDirectContextAccess from './eslint-rules/no-direct-context-access.mjs'

export default defineConfig(
	{
		ignores: [
			'app/calliope-websockets/dist',
			'app/rhea-backend/dist',
			'app/rhea-backend/prisma',
			'app/styx-frontend/build',
			'app/ts-shared/dist',
			'e2e/dist',
			'*.gen.ts',
			'node_modules',
			'.husky',
		],
	},
	{
		extends: [...tseslint.configs.recommended],
		files: ['**/*.{mjs,js,ts,tsx,json}'],
		plugins: {
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
			'no-relative-import-paths': noRelativeImportPaths,
			'mui-path-imports': muiPathImports,
		},
		rules: {
			'linebreak-style': ['error', 'unix'],
			'no-tabs': 'off',
			'no-trailing-spaces': 'off',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'error',
			'object-curly-spacing': 'off',
			'no-case-declarations': 'off',
			'space-before-function-paren': 'off',
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'unused-imports/no-unused-imports': 'error',
			'react/no-unescaped-entities': 'off',
			'mui-path-imports/mui-path-imports': 'error',
			'@typescript-eslint/no-unused-vars': 'off',

			'no-relative-import-paths/no-relative-import-paths': [
				'warn',
				{ allowSameFolder: true, rootDir: 'src', prefix: '@', allowedDepth: 2 },
			],

			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],
		},
	},
	{
		// Custom rules for rhea-backend to enforce moonflower patterns
		files: ['app/rhea-backend/src/routers/**/*.ts'],
		plugins: {
			timelines: {
				rules: {
					'no-direct-context-access': noDirectContextAccess,
				},
			},
		},
		rules: {
			'timelines/no-direct-context-access': 'warn',
		},
	},
	{
		ignores: ['app/rhea-backend/**'],
		plugins: {
			react,
			'react-hooks': reactHooks,
		},
		extends: [react.configs.flat.recommended, react.configs.flat['jsx-runtime']],
		rules: {
			...reactHooks.configs['recommended-latest'].rules,
			'react-hooks/set-state-in-effect': 'off',
			'react-hooks/refs': 'off',
			'react-hooks/immutability': 'off',
			'react-hooks/preserve-manual-memoization': 'off',
			'react/prop-types': 'off',
		},
		files: ['**/*.{ts,tsx}'],
		settings: {
			react: {
				version: '19.x',
			},
		},
	},
	eslintConfigPrettier,
	eslintPluginPrettierRecommended,
)
