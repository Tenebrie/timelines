import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerGetEventDetailsTool } from './getEventDetails.tool.js'

const server = setupTestServer()

const worldDetailsResponse = {
	id: 'world-456',
	name: 'Test World',
	isReadOnly: false,
	events: [
		{
			id: 'e1',
			name: 'Dragon Attack',
			timestamp: '1440',
			mentions: [{ targetId: 'a1' }],
			mentionedIn: [],
		},
		{
			id: 'e2',
			name: 'Peace Treaty',
			timestamp: '10000',
			mentions: [],
			mentionedIn: [{ sourceId: 'e1' }],
		},
	],
	actors: [{ id: 'a1', name: 'Red Dragon', title: 'Ancient Beast' }],
	tags: [],
}

describe('get_event_details tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerGetEventDetailsTool(server)
		})

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('returns event details with content', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: worldDetailsResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/event/e1/content',
			response: {
				contentHtml: '<p>A dragon attacked the village at dawn.</p>',
			},
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		const result = await client.callTool({
			name: 'get_event_details',
			arguments: { eventName: 'Dragon Attack' },
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		const allText = texts.join('\n')

		expect(result.isError).toBeUndefined()
		expect(allText).toContain('Event: Dragon Attack')
		expect(allText).toContain('ID: e1')
		expect(allText).toContain('Timestamp: 1440')
		expect(allText).toContain('A dragon attacked the village at dawn.')
	})

	it('shows No content when event has no content', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: worldDetailsResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/event/e2/content',
			response: { contentHtml: '' },
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		const result = await client.callTool({
			name: 'get_event_details',
			arguments: { eventName: 'Peace Treaty' },
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		expect(texts[0]).toContain('No content')
	})

	it('includes mentions information', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: worldDetailsResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/event/e1/content',
			response: { contentHtml: '<p>Content</p>' },
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		const result = await client.callTool({
			name: 'get_event_details',
			arguments: { eventName: 'Dragon Attack' },
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		const allText = texts.join('\n')

		// The mention of actor a1 "Red Dragon" should appear
		expect(allText).toContain('Mentions:')
		expect(allText).toContain('Red Dragon')
	})

	it('returns an error when event is not found', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: worldDetailsResponse,
		})

		const result = await client.callTool({
			name: 'get_event_details',
			arguments: { eventName: 'Nonexistent Event' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error fetching event')
	})

	it('uses fuzzy matching', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: worldDetailsResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/event/e1/content',
			response: { contentHtml: '' },
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		const result = await client.callTool({
			name: 'get_event_details',
			arguments: { eventName: 'dragon' },
		})

		expect(result.isError).toBeUndefined()
		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		expect(texts[0]).toContain('Event: Dragon Attack')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'get_event_details',
			arguments: { eventName: 'Some Event' },
		})

		expect(result.isError).toBe(true)
	})
})
