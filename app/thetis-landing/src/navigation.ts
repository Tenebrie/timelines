import { getPermalink } from './utils/permalinks'

export const headerData = {
	links: [
		{
			text: 'Features',
			href: getPermalink('/#features'),
		},
		{
			text: 'Showcase',
			href: getPermalink('/#showcase'),
		},
		{
			text: 'How It Works',
			href: getPermalink('/#how-it-works'),
		},
		{
			text: 'Pricing',
			href: getPermalink('/#pricing'),
		},
		{
			text: 'FAQ',
			href: getPermalink('/#faq'),
		},
	],
	actions: [
		{ text: 'Login', href: '#app' },
		{ text: 'Get Started', href: '#app' },
	],
}

export const footerData = {
	links: [
		{
			title: 'Product',
			links: [
				{ text: 'Features', href: getPermalink('/#features') },
				{ text: 'Showcase', href: getPermalink('/#showcase') },
				{ text: 'How It Works', href: getPermalink('/#how-it-works') },
				{ text: 'FAQ', href: getPermalink('/#faq') },
			],
		},
		{
			title: 'Resources',
			links: [
				{ text: 'GitHub', href: 'https://github.com/tenebrie/timelines' },
				{ text: 'Changelog', href: '#' },
				{ text: 'Roadmap', href: '#' },
			],
		},
		{
			title: 'Community',
			links: [
				{ text: 'Discord', href: '#' },
				{ text: 'Reddit', href: '#' },
				{ text: 'Contribute', href: 'https://github.com/tenebrie/timelines' },
			],
		},
		{
			title: 'Legal',
			links: [
				{ text: 'Privacy Policy', href: getPermalink('/privacy') },
				{ text: 'Terms of Use', href: getPermalink('/terms') },
			],
		},
	],
	secondaryLinks: [
		{ text: 'Terms', href: getPermalink('/terms') },
		{ text: 'Privacy Policy', href: getPermalink('/privacy') },
	],
	socialLinks: [
		{ ariaLabel: 'GitHub', icon: 'tabler:brand-github', href: 'https://github.com/tenebrie/timelines' },
		{ ariaLabel: 'Discord', icon: 'tabler:brand-discord', href: '#' },
	],
	footNote: `
    <span class="text-muted">© 2022–2026 Neverkin. Open source under <a class="text-primary hover:underline" href="https://github.com/tenebrie/timelines">GPL-3.0</a>.</span>
  `,
}
