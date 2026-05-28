import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { mockWorldActor, mockWorldDetails, mockWorldEvent } from '@src/test-utils/mockWorldDetails.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerGetActorDetailsTool } from './getActorDetails.tool.js'

const server = setupTestServer()

const worldDetailsResponse = mockWorldDetails({
	events: [
		mockWorldEvent({
			id: 'e1',
			name: 'Battle',
			timestamp: '100',
			descriptionRich: 'Some description',
		}),
	],
	actors: [
		mockWorldActor({
			id: 'a1',
			name: 'Gandalf',
			descriptionRich: 'Some description',
			title: 'The Grey',
			pages: [
				{ id: 'p1', name: 'Knowledge' },
				{ id: 'p2', name: 'Relationships' },
			],
			mentions: [{ targetId: 'e1', targetType: 'Event' }],
		}),
		mockWorldActor({
			id: 'a2',
			name: 'Frodo',
			descriptionRich: 'Some description',
			title: 'Ring Bearer',
			mentionedIn: [{ sourceId: 'a1', sourceType: 'Actor' }],
		}),
	],
})

describe('get_actor_details tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerGetActorDetailsTool(server)
		})

		await ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('returns actor details with main content', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: worldDetailsResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/actor/a1/content',
			response: {
				contentHtml: '<p>A powerful wizard who guards Middle Earth.</p>',
			},
		})

		const result = await client.callTool({
			name: 'get_actor_details',
			arguments: { actorName: 'Gandalf' },
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		const allText = texts.join('\n')

		expect(result.isError).toBeUndefined()
		expect(allText).toContain('Actor: Gandalf')
		expect(allText).toContain('ID: a1')
		expect(allText).toContain('Title: The Grey')
		expect(allText).toContain('(Main content)')
		expect(allText).toContain('A powerful wizard who guards Middle Earth.')
	})

	it('returns content for a specific page', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: worldDetailsResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/actor/a1/content/pages/p1',
			response: {
				contentHtml: '<p>Knows ancient lore and fire magic.</p>',
			},
		})

		const result = await client.callTool({
			name: 'get_actor_details',
			arguments: { actorName: 'Gandalf', pageName: 'Knowledge' },
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		const allText = texts.join('\n')

		expect(result.isError).toBeUndefined()
		expect(allText).toContain('Page: Knowledge')
		expect(allText).toContain('Knows ancient lore and fire magic.')
	})

	it('lists available pages', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: worldDetailsResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/actor/a1/content',
			response: { contentHtml: '' },
		})

		const result = await client.callTool({
			name: 'get_actor_details',
			arguments: { actorName: 'Gandalf' },
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		const allText = texts.join('\n')

		expect(allText).toContain('"Knowledge"')
		expect(allText).toContain('"Relationships"')
	})

	it('shows (None) when actor has no pages', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: worldDetailsResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/actor/a2/content',
			response: { contentHtml: '' },
		})

		const result = await client.callTool({
			name: 'get_actor_details',
			arguments: { actorName: 'Frodo' },
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		const pagesText = texts.find((t) => t.startsWith('Pages:'))

		expect(pagesText).toContain('(None)')
	})

	it('includes color in actor details', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: mockWorldDetails({
				actors: [
					mockWorldActor({
						id: 'a1',
						name: 'Gandalf',
						title: 'The Grey',
						color: '#bf8a40',
					}),
				],
			}),
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/actor/a1/content',
			response: { contentHtml: '' },
		})

		const result = await client.callTool({
			name: 'get_actor_details',
			arguments: { actorName: 'Gandalf' },
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		expect(result.isError).toBeUndefined()
		expect(texts[0]).toContain('Color: #bf8a40')
	})

	it('shows (None) when actor has no title', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: mockWorldDetails({
				actors: [
					mockWorldActor({
						id: 'a3',
						name: 'Nameless',
						title: '',
					}),
				],
			}),
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/actor/a3/content',
			response: { contentHtml: '' },
		})

		const result = await client.callTool({
			name: 'get_actor_details',
			arguments: { actorName: 'Nameless' },
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		const mainText = texts[0]

		expect(mainText).toContain('Title: (None)')
	})

	it('uses fuzzy matching to find actors', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: worldDetailsResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/actor/a1/content',
			response: { contentHtml: '' },
		})

		const result = await client.callTool({
			name: 'get_actor_details',
			arguments: { actorName: 'gandalf' },
		})

		expect(result.isError).toBeUndefined()
		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		expect(texts[0]).toContain('Actor: Gandalf')
	})

	it('returns an error when actor is not found', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: worldDetailsResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		const result = await client.callTool({
			name: 'get_actor_details',
			arguments: { actorName: 'Sauron' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error fetching actor details')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'get_actor_details',
			arguments: { actorName: 'Gandalf' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error fetching actor details')
	})

	it('shows (No content provided) when actor has no content', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: worldDetailsResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/actor/a2/content',
			response: { contentHtml: '' },
		})

		const result = await client.callTool({
			name: 'get_actor_details',
			arguments: { actorName: 'Frodo' },
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		expect(texts[0]).toContain('(No content provided)')
	})
})
