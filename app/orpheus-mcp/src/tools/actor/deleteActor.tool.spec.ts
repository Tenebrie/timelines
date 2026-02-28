import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerDeleteActorTool } from './deleteActor.tool.js'

const server = setupTestServer()

describe('delete_actor tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerDeleteActorTool(server)
		})

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('deletes an actor successfully', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [{ id: 'a1', name: 'Boromir', title: 'Son of Gondor' }],
				tags: [],
			},
		})

		const mock = generateEndpointMock(server, {
			method: 'delete',
			path: '/api/world/world-456/actor/a1',
			response: {},
		})

		const result = await client.callTool({
			name: 'delete_actor',
			arguments: { actorName: 'Boromir' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Boromir')
		expect(text).toContain('deleted successfully')
		expect(text).toContain('a1')
		expect(mock.hasBeenCalled()).toBe(true)
	})

	it('returns an error when actor is not found', async () => {
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
			name: 'delete_actor',
			arguments: { actorName: 'NonexistentActor' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error deleting actor')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'delete_actor',
			arguments: { actorName: 'Boromir' },
		})

		expect(result.isError).toBe(true)
	})

	it('uses fuzzy matching to find the actor', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [{ id: 'a1', name: 'Boromir', title: '' }],
				tags: [],
			},
		})

		generateEndpointMock(server, {
			method: 'delete',
			path: '/api/world/world-456/actor/a1',
			response: {},
		})

		const result = await client.callTool({
			name: 'delete_actor',
			arguments: { actorName: 'boromir' },
		})

		expect(result.isError).toBeUndefined()
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Boromir')
	})
})
