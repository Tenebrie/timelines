import mdx from '@astrojs/mdx'
import partytown from '@astrojs/partytown'
import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'
import tailwindcss from '@tailwindcss/vite'
import type { AstroIntegration } from 'astro'
import { defineConfig } from 'astro/config'
import compress from 'astro-compress'
import icon from 'astro-icon'
import path from 'path'
import { fileURLToPath } from 'url'

import llmsTxt from './src/integrations/llmsTxt'
import {
	lazyImagesRehypePlugin,
	readingTimeRemarkPlugin,
	responsiveTablesRehypePlugin,
} from './src/utils/frontmatter'
import astrowind from './vendor/integration'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const hasExternalScripts = false
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
	hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : []

export default defineConfig({
	output: 'static',
	site: 'https://neverkin.com',

	server: {
		host: '0.0.0.0',
		port: 8081,
	},
	trailingSlash: 'never',

	integrations: [
		starlight({
			title: 'Neverkin Docs',
			// AstroWind already provides src/pages/404.astro — let it own the 404 route.
			disable404Route: true,
			favicon: '/favicon.ico',
			components: {
				Head: './src/components/starlight/Head.astro',
				SiteTitle: './src/components/starlight/SiteTitle.astro',
			},
			sidebar: [
				{
					label: 'Neverkin Docs',
					items: [
						{ label: 'Introduction', slug: 'docs' },
						{ label: 'Getting started', autogenerate: { directory: 'docs/Onboarding' } },
						{ label: 'Features', autogenerate: { directory: 'docs/Features' } },
						{
							label: 'Neverkin Desktop',
							autogenerate: { directory: 'docs/Neverkin Desktop' },
						},
						{
							label: 'Self-hosting',
							autogenerate: { directory: 'docs/Self-hosting' },
						},
					],
				},
			],
		}),
		sitemap({
			customPages: [
				'https://neverkin.com/',
				'https://app.neverkin.com/login',
				'https://app.neverkin.com/create-account',
				'https://status.neverkin.com/',
			],
		}),
		llmsTxt({
			title: 'Neverkin',
			sectionTitles: {
				'docs/neverkin-desktop': 'Neverkin Desktop',
				'docs/self-hosting': 'Self-hosting',
			},
		}),

		mdx(),
		icon({
			include: {
				tabler: ['*'],
				'flat-color-icons': [
					'template',
					'gallery',
					'approval',
					'document',
					'advertising',
					'currency-exchange',
					'voice-presentation',
					'business-contact',
					'database',
				],
			},
		}),

		...whenExternalScripts(() =>
			partytown({
				config: { forward: ['dataLayer.push'] },
			}),
		),

		compress({
			CSS: true,
			HTML: {
				'html-minifier-terser': {
					removeAttributeQuotes: false,
				},
			},
			Image: false,
			JavaScript: true,
			SVG: false,
			Logger: 1,
		}),

		astrowind({
			config: './src/config.yaml',
		}),
	],

	image: {
		domains: ['cdn.pixabay.com'],
	},

	markdown: {
		remarkPlugins: [readingTimeRemarkPlugin],
		rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
	},

	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'~': path.resolve(__dirname, './src'),
			},
		},
	},
})
