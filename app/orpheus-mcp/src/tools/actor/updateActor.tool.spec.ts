import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerUpdateActorTool } from './updateActor.tool.js'

const server = setupTestServer()

describe('update_actor tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerUpdateActorTool(server)
		})

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('updates an actor name', async () => {
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

		generateEndpointMock(server, {
			method: 'patch',
			path: '/api/world/world-456/actor/a1',
			response: {
				id: 'a1',
				name: 'Gandalf the White',
				title: 'The Grey',
			},
		})

		const result = await client.callTool({
			name: 'update_actor',
			arguments: { actorName: 'Gandalf', name: 'Gandalf the White' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Actor updated successfully')
		expect(text).toContain('Gandalf the White')
	})

	it('updates an actor title', async () => {
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

		generateEndpointMock(server, {
			method: 'patch',
			path: '/api/world/world-456/actor/a1',
			response: {
				id: 'a1',
				name: 'Gandalf',
				title: 'The White',
			},
		})

		const result = await client.callTool({
			name: 'update_actor',
			arguments: { actorName: 'Gandalf', title: 'The White' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(text).toContain('Title: The White')
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
				actors: [{ id: 'a1', name: 'Gandalf', title: '' }],
				tags: [],
			},
		})

		const result = await client.callTool({
			name: 'update_actor',
			arguments: { actorName: 'Sauron', name: 'New name' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error updating actor')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'update_actor',
			arguments: { actorName: 'Gandalf', name: 'New name' },
		})

		expect(result.isError).toBe(true)
	})

	it('shows (None) when updated title is empty', async () => {
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

		generateEndpointMock(server, {
			method: 'patch',
			path: '/api/world/world-456/actor/a1',
			response: {
				id: 'a1',
				name: 'Gandalf',
				title: '',
			},
		})

		const result = await client.callTool({
			name: 'update_actor',
			arguments: { actorName: 'Gandalf', title: '' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Title: (None)')
	})
})
