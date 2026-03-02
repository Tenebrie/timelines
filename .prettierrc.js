module.exports = {
	semi: false,
	singleQuote: true,
	printWidth: 110,
	useTabs: true,

	plugins: ['prettier-plugin-astro'],
	overrides: [
		{
			files: '*.astro',
			options: {
				parser: 'astro',
			},
		},
	],
}
