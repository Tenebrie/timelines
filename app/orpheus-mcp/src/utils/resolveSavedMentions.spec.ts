import { describe, expect, it } from 'vitest'

import { resolveSavedMentions } from './resolveSavedMentions.js'

type WorldData = Parameters<typeof resolveSavedMentions>[0]['worldData']
type ArticleData = Parameters<typeof resolveSavedMentions>[0]['articleData']

const mockWorldData = {
	actors: [
		{ id: 'actor-1', name: 'Alice', title: 'Queen of the North', descriptionRich: 'She is brave and wise.' },
		{ id: 'actor-2', name: 'Bob the Builder', title: '', descriptionRich: 'A skilled craftsman.' },
	],
	events: [
		{ id: 'event-1', name: 'The Great Battle', descriptionRich: 'A terrible conflict erupted.' },
		{ id: 'event-2', name: 'Peace Treaty Signing', descriptionRich: '' },
	],
	tags: [{ id: 'tag-1', name: 'Important', description: 'Critical events and turning points.' }],
} as unknown as WorldData

const mockArticleData = [
	{ id: 'article-1', name: 'Lore Overview', contentRich: 'The full history of the world.' },
] as unknown as ArticleData

const noMentions = { mentions: [], mentionedIn: [] }

describe('resolveSavedMentions', () => {
	describe('output structure', () => {
		it('returns two text blocks: Mentions and Mentioned in', () => {
			const result = resolveSavedMentions({
				entity: noMentions,
				worldData: mockWorldData,
				articleData: mockArticleData,
			})
			expect(result).toHaveLength(2)
			expect(result[0].type).toBe('text')
			expect(result[1].type).toBe('text')
			expect(result[0].text).toMatch(/^Mentions:/)
			expect(result[1].text).toMatch(/^Mentioned in:/)
		})

		it('shows (None) for empty mentions', () => {
			const result = resolveSavedMentions({
				entity: noMentions,
				worldData: mockWorldData,
				articleData: mockArticleData,
			})
			expect(result[0].text).toBe('Mentions:\n(None)')
			expect(result[1].text).toBe('Mentioned in:\n(None)')
		})
	})

	describe('mentions (outgoing)', () => {
		it('includes the entity fullName, type, and summary', () => {
			const entity = { mentions: [{ targetId: 'event-1' }], mentionedIn: [] }
			const [mentionsBlock] = resolveSavedMentions({
				entity,
				worldData: mockWorldData,
				articleData: mockArticleData,
			})
			expect(mentionsBlock.text).toBe('Mentions:\n- [event] The Great Battle: A terrible conflict erupted.')
		})

		it('includes the actor title in fullName', () => {
			const entity = { mentions: [{ targetId: 'actor-1' }], mentionedIn: [] }
			const [mentionsBlock] = resolveSavedMentions({
				entity,
				worldData: mockWorldData,
				articleData: mockArticleData,
			})
			expect(mentionsBlock.text).toContain('Alice, Queen of the North')
			expect(mentionsBlock.text).toContain('[actor]')
		})

		it('omits title suffix when actor has no title', () => {
			const entity = { mentions: [{ targetId: 'actor-2' }], mentionedIn: [] }
			const [mentionsBlock] = resolveSavedMentions({
				entity,
				worldData: mockWorldData,
				articleData: mockArticleData,
			})
			expect(mentionsBlock.text).toContain('[actor] Bob the Builder')
		})

		it('includes tag mention with summary', () => {
			const entity = { mentions: [{ targetId: 'tag-1' }], mentionedIn: [] }
			const [mentionsBlock] = resolveSavedMentions({
				entity,
				worldData: mockWorldData,
				articleData: mockArticleData,
			})
			expect(mentionsBlock.text).toBe('Mentions:\n- [tag] Important: Critical events and turning points.')
		})

		it('includes article mention with summary', () => {
			const entity = { mentions: [{ targetId: 'article-1' }], mentionedIn: [] }
			const [mentionsBlock] = resolveSavedMentions({
				entity,
				worldData: mockWorldData,
				articleData: mockArticleData,
			})
			expect(mentionsBlock.text).toBe('Mentions:\n- [article] Lore Overview: The full history of the world.')
		})

		it('silently skips mentions to unresolvable IDs', () => {
			const entity = { mentions: [{ targetId: 'actor-1' }, { targetId: 'unknown-id' }], mentionedIn: [] }
			const [mentionsBlock] = resolveSavedMentions({
				entity,
				worldData: mockWorldData,
				articleData: mockArticleData,
			})
			expect(mentionsBlock.text).toContain('Alice')
			expect(mentionsBlock.text).not.toContain('unknown-id')
		})

		it('summary only shows the first line of rich content', () => {
			const worldData = {
				...mockWorldData,
				events: [
					{
						id: 'event-1',
						name: 'Multi-line Event',
						descriptionRich: '<p>First line.</p><p>Second line.</p>',
					},
				],
			} as unknown as WorldData
			const entity = { mentions: [{ targetId: 'event-1' }], mentionedIn: [] }
			const [mentionsBlock] = resolveSavedMentions({ entity, worldData, articleData: mockArticleData })
			expect(mentionsBlock.text).toContain('First line.')
			expect(mentionsBlock.text).not.toContain('Second line.')
		})

		it('summary converts mention spans to @[Name] shorthand', () => {
			const aliceMentionSpan =
				'<span data-component-props="{&quot;actor&quot;:&quot;actor-1&quot;}" data-type="mention" data-name="Alice"></span>'
			const worldData = {
				...mockWorldData,
				events: [{ id: 'event-1', name: 'The Great Battle', descriptionRich: `Led by ${aliceMentionSpan}.` }],
			} as unknown as WorldData
			const entity = { mentions: [{ targetId: 'event-1' }], mentionedIn: [] }
			const [mentionsBlock] = resolveSavedMentions({ entity, worldData, articleData: mockArticleData })
			expect(mentionsBlock.text).toContain('@[Alice]')
			expect(mentionsBlock.text).not.toContain('data-type="mention"')
		})

		it('shows empty summary when entity has no content', () => {
			const entity = { mentions: [{ targetId: 'event-2' }], mentionedIn: [] }
			const [mentionsBlock] = resolveSavedMentions({
				entity,
				worldData: mockWorldData,
				articleData: mockArticleData,
			})
			expect(mentionsBlock.text).toBe('Mentions:\n- [event] Peace Treaty Signing: ')
		})
	})

	describe('mentionedIn (incoming)', () => {
		it('shows name and type of referencing entities', () => {
			const entity = { mentions: [], mentionedIn: [{ sourceId: 'article-1' }] }
			const [, mentionedInBlock] = resolveSavedMentions({
				entity,
				worldData: mockWorldData,
				articleData: mockArticleData,
			})
			expect(mentionedInBlock.text).toBe('Mentioned in:\n- [article] Lore Overview')
		})

		it('silently skips unresolvable source IDs', () => {
			const entity = { mentions: [], mentionedIn: [{ sourceId: 'unknown-id' }] }
			const [, mentionedInBlock] = resolveSavedMentions({
				entity,
				worldData: mockWorldData,
				articleData: mockArticleData,
			})
			expect(mentionedInBlock.text).toBe('Mentioned in:\n(None)')
		})

		it('does not include summary in mentionedIn output', () => {
			const entity = { mentions: [], mentionedIn: [{ sourceId: 'event-1' }] }
			const [, mentionedInBlock] = resolveSavedMentions({
				entity,
				worldData: mockWorldData,
				articleData: mockArticleData,
			})
			expect(mentionedInBlock.text).not.toContain('terrible conflict')
		})
	})
})
