import { describe, expect, it } from 'vitest'

import { resolveShorthandMentions } from './resolveShorthandMentions.js'

const mockWorldData = {
	actors: [
		{ id: 'actor-1', name: 'Alice' },
		{ id: 'actor-2', name: 'Bob the Builder' },
	],
	events: [
		{ id: 'event-1', name: 'The Great Battle' },
		{ id: 'event-2', name: 'Peace Treaty Signing' },
	],
	tags: [
		{ id: 'tag-1', name: 'Important' },
		{ id: 'tag-2', name: 'Historical' },
	],
} as Parameters<typeof resolveShorthandMentions>[0]['worldData']

const mockArticleData = [
	{ id: 'article-1', name: 'Lore Overview' },
	{ id: 'article-2', name: 'Character Guide' },
] as Parameters<typeof resolveShorthandMentions>[0]['articleData']

describe('resolveShorthandMentions', () => {
	it('resolves actor mention by exact name', async () => {
		const result = await resolveShorthandMentions({
			content: 'Mentioning @[Alice]',
			worldData: mockWorldData,
			articleData: mockArticleData,
		})

		expect(result).toBe(
			'Mentioning <span data-component-props="{&quot;actor&quot;:&quot;actor-1&quot;}" data-type="mention" data-name="Alice"></span>',
		)
	})

	it('resolves actor mention by fuzzy match', async () => {
		const result = await resolveShorthandMentions({
			content: 'Mentioning @[Bob]',
			worldData: mockWorldData,
			articleData: mockArticleData,
		})

		expect(result).toBe(
			'Mentioning <span data-component-props="{&quot;actor&quot;:&quot;actor-2&quot;}" data-type="mention" data-name="Bob the Builder"></span>',
		)
	})

	it('resolves event mention', async () => {
		const result = await resolveShorthandMentions({
			content: 'During @[The Great Battle]',
			worldData: mockWorldData,
			articleData: mockArticleData,
		})

		expect(result).toBe(
			'During <span data-component-props="{&quot;event&quot;:&quot;event-1&quot;}" data-type="mention" data-name="The Great Battle"></span>',
		)
	})

	it('resolves tag mention', async () => {
		const result = await resolveShorthandMentions({
			content: 'This is @[Important]',
			worldData: mockWorldData,
			articleData: mockArticleData,
		})

		expect(result).toBe(
			'This is <span data-component-props="{&quot;tag&quot;:&quot;tag-1&quot;}" data-type="mention" data-name="Important"></span>',
		)
	})

	it('resolves article mention', async () => {
		const result = await resolveShorthandMentions({
			content: 'See @[Lore Overview]',
			worldData: mockWorldData,
			articleData: mockArticleData,
		})

		expect(result).toBe(
			'See <span data-component-props="{&quot;article&quot;:&quot;article-1&quot;}" data-type="mention" data-name="Lore Overview"></span>',
		)
	})

	it('resolves multiple mentions in same content', async () => {
		const result = await resolveShorthandMentions({
			content: '@[Alice] met @[Bob] at @[The Great Battle]',
			worldData: mockWorldData,
			articleData: mockArticleData,
		})

		expect(result).toContain('data-name="Alice"')
		expect(result).toContain('data-name="Bob the Builder"')
		expect(result).toContain('data-name="The Great Battle"')
	})

	it('does not modify content without shorthand mentions', async () => {
		const content = 'Plain text without any mentions'
		const result = await resolveShorthandMentions({
			content,
			worldData: mockWorldData,
			articleData: mockArticleData,
		})

		expect(result).toBe(content)
	})

	it('does not modify existing HTML mentions', async () => {
		const existingMention =
			'<span data-component-props="{&quot;actor&quot;:&quot;existing-id&quot;}" data-type="mention" data-name="Existing"></span>'
		const result = await resolveShorthandMentions({
			content: `Already has ${existingMention}`,
			worldData: mockWorldData,
			articleData: mockArticleData,
		})

		expect(result).toBe(`Already has ${existingMention}`)
	})

	it('throws error for unmatched mention', async () => {
		await expect(
			resolveShorthandMentions({
				content: 'Mentioning @[Unknown Entity]',
				worldData: mockWorldData,
				articleData: mockArticleData,
			}),
		).rejects.toThrow('Unable to resolve mention "@[Unknown Entity]"')
	})
})
