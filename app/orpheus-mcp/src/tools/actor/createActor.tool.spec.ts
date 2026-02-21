import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerCreateActorTool } from './createActor.tool.js'

const server = setupTestServer()

describe('create_actor tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerCreateActorTool(server)
		})

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('creates an actor with name only', async () => {
		// checkActorDoesNotExist calls getWorldDetails
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

		const mock = generateEndpointMock(server, {
			method: 'post',
			path: '/api/world/world-456/actors',
			response: {
				id: 'new-actor-id',
				name: 'Aragorn',
				title: '',
			},
		})

		const result = await client.callTool({
			name: 'create_actor',
			arguments: { name: 'Aragorn' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Actor created successfully')
		expect(text).toContain('Aragorn')
		expect(text).toContain('new-actor-id')
		expect(mock.hasBeenCalled()).toBe(true)
	})

	it('creates an actor with name and title', async () => {
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

		generateEndpointMock(server, {
			method: 'post',
			path: '/api/world/world-456/actors',
			response: {
				id: 'actor-2',
				name: 'Legolas',
				title: 'Prince of Mirkwood',
			},
		})

		const result = await client.callTool({
			name: 'create_actor',
			arguments: { name: 'Legolas', title: 'Prince of Mirkwood' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Legolas')
		expect(text).toContain('Prince of Mirkwood')
	})

	it('returns error when actor already exists', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [{ id: 'a1', name: 'Gandalf', title: 'The Grey' }],
				tags: [],
			},
		})

		const result = await client.callTool({
			name: 'create_actor',
			arguments: { name: 'Gandalf' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('already exists')
	})

	it('returns an error when the API call fails', async () => {
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

		generateEndpointMock(server, {
			method: 'post',
			path: '/api/world/world-456/actors',
			error: { status: 500, message: 'Server error' },
		})

		const result = await client.callTool({
			name: 'create_actor',
			arguments: { name: 'Failing Actor' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error creating actor')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'create_actor',
			arguments: { name: 'No World Actor' },
		})

		expect(result.isError).toBe(true)
	})

	it('shows Title: None when no title is provided', async () => {
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

		generateEndpointMock(server, {
			method: 'post',
			path: '/api/world/world-456/actors',
			response: {
				id: 'a-no-title',
				name: 'Simple Actor',
				title: '',
			},
		})

		const result = await client.callTool({
			name: 'create_actor',
			arguments: { name: 'Simple Actor' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Title: None')
	})
})
