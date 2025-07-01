import eslintConfigPrettier from 'eslint-config-prettier'
import muiPathImports from 'eslint-plugin-mui-path-imports'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{ ignores: ['build', '*.gen.ts', 'node_modules'] },
	{
		extends: [...tseslint.configs.recommended],
		files: ['**/*.{js,ts,tsx}'],
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
		plugins: {
			react,
		},
		extends: [
			react.configs.flat.recommended,
			react.configs.flat['jsx-runtime'],
			reactHooks.configs['recommended-latest'],
		],
		files: ['**/*.{js,ts,tsx}'],
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
	eslintConfigPrettier,
	eslintPluginPrettierRecommended,
)
