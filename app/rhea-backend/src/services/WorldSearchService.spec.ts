import { mockActor, mockTag, mockWikiArticle, mockWorldEvent } from '@src/mock/mock.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { WorldSearchService } from './WorldSearchService.js'

describe('WorldSearchService', () => {
	describe('with mocked search functions', () => {
		beforeEach(() => {
			vi.spyOn(WorldSearchService, 'findActors').mockResolvedValue([])
			vi.spyOn(WorldSearchService, 'findArticles').mockResolvedValue([])
			vi.spyOn(WorldSearchService, 'findEvents').mockResolvedValue([])
			vi.spyOn(WorldSearchService, 'findTags').mockResolvedValue([])
		})

		it('gracefully resolves empty results', async () => {
			const result = WorldSearchService.search({
				worldId: 'world-1',
				query: 'test',
				mode: 'string_match',
				include: ['actor', 'article', 'event', 'tag'],
			})
			await expect(result).resolves.toEqual({
				actors: [],
				articles: [],
				events: [],
				tags: [],
			})
		})

		it('finds all matching entities with full string match', async () => {
			vi.spyOn(WorldSearchService, 'findActors').mockResolvedValueOnce([
				mockActor({ name: 'not a partially matching actor' }),
			])
			vi.spyOn(WorldSearchService, 'findArticles').mockResolvedValue([
				mockWikiArticle({ name: 'not a partially matching article' }),
			])
			vi.spyOn(WorldSearchService, 'findEvents').mockResolvedValue([
				mockWorldEvent({ name: 'not a partially matching event' }),
			])
			vi.spyOn(WorldSearchService, 'findTags').mockResolvedValue([
				mockTag({ name: 'not a partially matching tag' }),
			])

			const result = WorldSearchService.search({
				worldId: 'world-1',
				query: 'not a partial',
				mode: 'string_match',
				include: ['actor', 'article', 'event', 'tag'],
			})
			await expect(result).resolves.toEqual({
				actors: [expect.objectContaining({ name: 'not a partially matching actor' })],
				articles: [expect.objectContaining({ name: 'not a partially matching article' })],
				events: [expect.objectContaining({ name: 'not a partially matching event' })],
				tags: [expect.objectContaining({ name: 'not a partially matching tag' })],
			})
		})

		it('searches for each part separately with split_by_space mode', async () => {
			vi.spyOn(WorldSearchService, 'findActors')
				.mockResolvedValueOnce([mockActor({ name: 'first query' })])
				.mockResolvedValueOnce([mockActor({ name: 'second query' })])
			vi.spyOn(WorldSearchService, 'findArticles')
				.mockResolvedValueOnce([mockWikiArticle({ name: 'first query' })])
				.mockResolvedValueOnce([mockWikiArticle({ name: 'second query' })])
			vi.spyOn(WorldSearchService, 'findEvents')
				.mockResolvedValueOnce([mockWorldEvent({ name: 'first query' })])
				.mockResolvedValueOnce([mockWorldEvent({ name: 'second query' })])
			vi.spyOn(WorldSearchService, 'findTags')
				.mockResolvedValueOnce([mockTag({ name: 'first query' })])
				.mockResolvedValueOnce([mockTag({ name: 'second query' })])

			const result = WorldSearchService.search({
				worldId: 'world-1',
				query: 'first second',
				mode: 'split_by_space',
				include: ['actor', 'article', 'event', 'tag'],
			})
			await expect(result).resolves.toEqual({
				actors: [
					expect.objectContaining({ name: 'first query' }),
					expect.objectContaining({ name: 'second query' }),
				],
				articles: [
					expect.objectContaining({ name: 'first query' }),
					expect.objectContaining({ name: 'second query' }),
				],
				events: [
					expect.objectContaining({ name: 'first query' }),
					expect.objectContaining({ name: 'second query' }),
				],
				tags: [
					expect.objectContaining({ name: 'first query' }),
					expect.objectContaining({ name: 'second query' }),
				],
			})
		})

		it('deduplicates results based on entity id', async () => {
			vi.spyOn(WorldSearchService, 'findActors')
				.mockResolvedValueOnce([mockActor({ id: '11', name: 'query' })])
				.mockResolvedValueOnce([mockActor({ id: '11', name: 'query' })])
			vi.spyOn(WorldSearchService, 'findArticles')
				.mockResolvedValueOnce([mockWikiArticle({ id: '22', name: 'query' })])
				.mockResolvedValueOnce([mockWikiArticle({ id: '22', name: 'query' })])
			vi.spyOn(WorldSearchService, 'findEvents')
				.mockResolvedValueOnce([mockWorldEvent({ id: '33', name: 'query' })])
				.mockResolvedValueOnce([mockWorldEvent({ id: '33', name: 'query' })])
			vi.spyOn(WorldSearchService, 'findTags')
				.mockResolvedValueOnce([mockTag({ id: '44', name: 'query' })])
				.mockResolvedValueOnce([mockTag({ id: '44', name: 'query' })])

			const result = WorldSearchService.search({
				worldId: 'world-1',
				query: 'first second',
				mode: 'split_by_space',
				include: ['actor', 'article', 'event', 'tag'],
			})
			await expect(result).resolves.toEqual({
				actors: [expect.objectContaining({ id: '11', name: 'query' })],
				articles: [expect.objectContaining({ id: '22', name: 'query' })],
				events: [expect.objectContaining({ id: '33', name: 'query' })],
				tags: [expect.objectContaining({ id: '44', name: 'query' })],
			})
		})
	})
})
