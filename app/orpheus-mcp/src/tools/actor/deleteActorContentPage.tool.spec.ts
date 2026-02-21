import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerDeleteActorContentPageTool } from './deleteActorContentPage.tool.js'

const server = setupTestServer()

describe('delete_actor_content_page tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerDeleteActorContentPageTool(server)
		})

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('deletes a content page successfully', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [
					{
						id: 'a1',
						name: 'Gandalf',
						title: 'The Grey',
						pages: [{ id: 'p1', name: 'Knowledge' }],
					},
				],
				tags: [],
			},
		})

		const mock = generateEndpointMock(server, {
			method: 'delete',
			path: '/api/world/world-456/actor/a1/content/pages/p1',
			response: {},
		})

		const result = await client.callTool({
			name: 'delete_actor_content_page',
			arguments: { actorName: 'Gandalf', pageName: 'Knowledge' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Knowledge')
		expect(text).toContain('has been deleted')
		expect(text).toContain('Gandalf')
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
			name: 'delete_actor_content_page',
			arguments: { actorName: 'NonexistentActor', pageName: 'SomePage' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error deleting content page')
	})

	it('returns an error when page is not found', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [
					{
						id: 'a1',
						name: 'Gandalf',
						title: '',
						pages: [{ id: 'p1', name: 'Knowledge' }],
					},
				],
				tags: [],
			},
		})

		const result = await client.callTool({
			name: 'delete_actor_content_page',
			arguments: { actorName: 'Gandalf', pageName: 'NonexistentPage' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error deleting content page')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'delete_actor_content_page',
			arguments: { actorName: 'Gandalf', pageName: 'Knowledge' },
		})

		expect(result.isError).toBe(true)
	})
})
