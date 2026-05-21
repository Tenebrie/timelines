import { describe, expect, it } from 'vitest'

import { resolveShorthandMentions } from './resolveShorthandMentions.js'
import { toAgentReadableText } from './toAgentReadableText.js'

type WorldData = Parameters<typeof resolveShorthandMentions>[0]['worldData']
type ArticleData = Parameters<typeof resolveShorthandMentions>[0]['articleData']

const createMockWorldData = (data: {
	actors?: { id: string; name: string }[]
	events?: { id: string; name: string }[]
	tags?: { id: string; name: string }[]
}): WorldData =>
	({
		actors: data.actors ?? [],
		events: data.events ?? [],
		tags: data.tags ?? [],
	}) as unknown as WorldData

const mockWorldData = createMockWorldData({
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
})

const mockArticleData = [
	{ id: 'article-1', name: 'Lore Overview' },
	{ id: 'article-2', name: 'Character Guide' },
] as ArticleData

const toReadable = (content: string) => toAgentReadableText({ content })

describe('toAgentReadableText', () => {
	it('converts an actor mention span to shorthand', () => {
		const html =
			'Mentioning <span data-component-props="{&quot;actor&quot;:&quot;actor-1&quot;}" data-type="mention" data-name="Alice"></span>'
		expect(toReadable(html)).toBe('Mentioning @[Alice]')
	})

	it('converts an event mention span to shorthand', () => {
		const html =
			'During <span data-component-props="{&quot;event&quot;:&quot;event-1&quot;}" data-type="mention" data-name="The Great Battle"></span>'
		expect(toReadable(html)).toBe('During @[The Great Battle]')
	})

	it('converts a tag mention span to shorthand', () => {
		const html =
			'This is <span data-component-props="{&quot;tag&quot;:&quot;tag-1&quot;}" data-type="mention" data-name="Important"></span>'
		expect(toReadable(html)).toBe('This is @[Important]')
	})

	it('converts an article mention span to shorthand', () => {
		const html =
			'See <span data-component-props="{&quot;article&quot;:&quot;article-1&quot;}" data-type="mention" data-name="Lore Overview"></span>'
		expect(toReadable(html)).toBe('See @[Lore Overview]')
	})

	it('converts multiple mention spans in the same content', () => {
		const html =
			'<span data-component-props="{&quot;actor&quot;:&quot;actor-1&quot;}" data-type="mention" data-name="Alice"></span>' +
			' met ' +
			'<span data-component-props="{&quot;actor&quot;:&quot;actor-2&quot;}" data-type="mention" data-name="Bob the Builder"></span>' +
			' at ' +
			'<span data-component-props="{&quot;event&quot;:&quot;event-1&quot;}" data-type="mention" data-name="The Great Battle"></span>'
		expect(toReadable(html)).toBe('@[Alice] met @[Bob the Builder] at @[The Great Battle]')
	})

	it('passes through content without any mention spans unchanged', () => {
		const content = 'Plain text without any mentions'
		expect(toReadable(content)).toBe(content)
	})

	it('passes through HTML without mention spans unchanged', () => {
		const content = '<h2>Head</h2><p>Paragraph</p>'
		expect(toReadable(content)).toBe(content)
	})

	it('does not convert @[Name] shorthand that is already in text', () => {
		const content = 'Already @[Alice] shorthand'
		expect(toReadable(content)).toBe('Already @[Alice] shorthand')
	})

	it('converts mention spans embedded inside other HTML elements', () => {
		const html =
			'<p>Mention is <span data-component-props="{&quot;article&quot;:&quot;article-1&quot;}" data-type="mention" data-name="Lore Overview"></span>. Post para.</p>'
		expect(toReadable(html)).toBe('<p>Mention is @[Lore Overview]. Post para.</p>')
	})
})

describe('round-trip: resolveShorthandMentions → toAgentReadableText', () => {
	it('exact actor name survives round-trip unchanged', async () => {
		const original = 'Mentioning @[Alice]'
		const html = await resolveShorthandMentions({
			content: original,
			worldData: mockWorldData,
			articleData: mockArticleData,
		})
		expect(toReadable(html)).toBe(original)
	})

	it('exact event name survives round-trip unchanged', async () => {
		const original = 'During @[The Great Battle]'
		const html = await resolveShorthandMentions({
			content: original,
			worldData: mockWorldData,
			articleData: mockArticleData,
		})
		expect(toReadable(html)).toBe(original)
	})

	it('exact tag name survives round-trip unchanged', async () => {
		const original = 'This is @[Important]'
		const html = await resolveShorthandMentions({
			content: original,
			worldData: mockWorldData,
			articleData: mockArticleData,
		})
		expect(toReadable(html)).toBe(original)
	})

	it('exact article name survives round-trip unchanged', async () => {
		const original = 'See @[Lore Overview]'
		const html = await resolveShorthandMentions({
			content: original,
			worldData: mockWorldData,
			articleData: mockArticleData,
		})
		expect(toReadable(html)).toBe(original)
	})

	it('fuzzy match resolves to canonical entity name in round-trip output', async () => {
		// @[Bob] fuzzy-matches "Bob the Builder", so the round-trip produces @[Bob the Builder]
		const html = await resolveShorthandMentions({
			content: 'Mentioning @[Bob]',
			worldData: mockWorldData,
			articleData: mockArticleData,
		})
		expect(toReadable(html)).toBe('Mentioning @[Bob the Builder]')
	})

	it('multiple mentions survive round-trip', async () => {
		const original = '@[Alice] met @[The Great Battle]'
		const html = await resolveShorthandMentions({
			content: original,
			worldData: mockWorldData,
			articleData: mockArticleData,
		})
		expect(toReadable(html)).toBe(original)
	})

	it('plain text without mentions survives round-trip unchanged', async () => {
		const original = 'Plain text without any mentions'
		const html = await resolveShorthandMentions({
			content: original,
			worldData: mockWorldData,
			articleData: mockArticleData,
		})
		expect(toReadable(html)).toBe(original)
	})

	it('HTML structure is preserved and mentions resolved in round-trip', async () => {
		const original =
			'<h2>Head</h2><p> Paragraph</p><p> Mention is @[Lore Overview]. Post para. </p><p> Ppp </p><p></p>'
		const html = await resolveShorthandMentions({
			content: original,
			worldData: mockWorldData,
			articleData: mockArticleData,
		})
		expect(toReadable(html)).toBe(original)
	})

	it('output of toAgentReadableText is valid input to resolveShorthandMentions', async () => {
		const original = 'Hello @[Alice] and @[Important]'
		const html = await resolveShorthandMentions({
			content: original,
			worldData: mockWorldData,
			articleData: mockArticleData,
		})
		const shorthand = toReadable(html)
		const htmlAgain = await resolveShorthandMentions({
			content: shorthand,
			worldData: mockWorldData,
			articleData: mockArticleData,
		})
		expect(htmlAgain).toBe(html)
	})
})
