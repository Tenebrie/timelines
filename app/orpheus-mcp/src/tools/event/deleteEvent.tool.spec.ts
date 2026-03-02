import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerDeleteEventTool } from './deleteEvent.tool.js'

const server = setupTestServer()

describe('delete_event tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerDeleteEventTool(server)
		})

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('deletes an event successfully', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [{ id: 'e1', name: 'Dragon Attack', timestamp: '100' }],
				actors: [],
				tags: [],
			},
		})

		const mock = generateEndpointMock(server, {
			method: 'delete',
			path: '/api/world/world-456/event/e1',
			response: {},
		})

		const result = await client.callTool({
			name: 'delete_event',
			arguments: { eventName: 'Dragon Attack' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Dragon Attack')
		expect(text).toContain('deleted successfully')
		expect(text).toContain('e1')
		expect(mock.hasBeenCalled()).toBe(true)
	})

	it('returns an error when event is not found', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [],
				tags: [],
			},
		})

		const result = await client.callTool({
			name: 'delete_event',
			arguments: { eventName: 'Nonexistent Event' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error deleting event')
	})

	it('uses fuzzy matching to find the event', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [{ id: 'e1', name: 'Dragon Attack', timestamp: '100' }],
				actors: [],
				tags: [],
			},
		})

		generateEndpointMock(server, {
			method: 'delete',
			path: '/api/world/world-456/event/e1',
			response: {},
		})

		const result = await client.callTool({
			name: 'delete_event',
			arguments: { eventName: 'dragon' },
		})

		expect(result.isError).toBeUndefined()
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Dragon Attack')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'delete_event',
			arguments: { eventName: 'Some Event' },
		})

		expect(result.isError).toBe(true)
	})
})
