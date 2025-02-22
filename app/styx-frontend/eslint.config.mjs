import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import muiPathImports from 'eslint-plugin-mui-path-imports'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
})

export default [
	...compat.extends(
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'plugin:prettier/recommended',
	),
	{
		ignores: ['*.gen.ts'],
		plugins: {
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
			'no-relative-import-paths': noRelativeImportPaths,
			'mui-path-imports': muiPathImports,
		},

		settings: {
			react: {
				version: 'detect',
			},
		},

		languageOptions: {
			globals: {
				...globals.node,
				Atomics: 'readonly',
				SharedArrayBuffer: 'readonly',
			},

			parser: tsParser,
			ecmaVersion: 2018,
			sourceType: 'module',
		},

		rules: {
			'linebreak-style': ['error', 'unix'],
			'no-tabs': 'off',
			'no-trailing-spaces': 'off',
			'no-unused-vars': 'off',
			'object-curly-spacing': 'off',
			'no-case-declarations': 'off',
			'space-before-function-paren': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/ban-ts-ignore': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'unused-imports/no-unused-imports': 'error',
			'react/no-unescaped-entities': 'off',
			'mui-path-imports/mui-path-imports': 'error',

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
]
