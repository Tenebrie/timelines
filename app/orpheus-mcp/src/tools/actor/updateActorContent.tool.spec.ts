import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerUpdateActorContentTool } from './updateActorContent.tool.js'

const server = setupTestServer()

const worldDetailsResponse = {
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
}

describe('update_actor_content tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerUpdateActorContentTool(server)
		})

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('updates main content successfully', async () => {
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

		const mock = generateEndpointMock(server, {
			method: 'put',
			path: '/api/world/world-456/actor/a1/content',
			response: {},
		})

		const result = await client.callTool({
			name: 'update_actor_content',
			arguments: {
				actorName: 'Gandalf',
				content: '<p>Updated wizard description.</p>',
			},
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		const allText = texts.join('\n')

		expect(result.isError).toBeUndefined()
		expect(allText).toContain('Main content has been updated')
		expect(mock.hasBeenCalled()).toBe(true)
	})

	it('updates an existing page', async () => {
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

		const mock = generateEndpointMock(server, {
			method: 'put',
			path: '/api/world/world-456/actor/a1/content/pages/p1',
			response: {},
		})

		const result = await client.callTool({
			name: 'update_actor_content',
			arguments: {
				actorName: 'Gandalf',
				content: '<p>Deep magical knowledge.</p>',
				pageName: 'Knowledge',
			},
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		const allText = texts.join('\n')

		expect(result.isError).toBeUndefined()
		expect(allText).toContain('Knowledge')
		expect(allText).toContain('has been updated')
		expect(mock.hasBeenCalled()).toBe(true)
	})

	it('creates a new page when it does not exist', async () => {
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
			method: 'post',
			path: '/api/world/world-456/actor/a1/content/pages',
			response: { id: 'p-new', name: 'NewPage' },
		})

		generateEndpointMock(server, {
			method: 'put',
			path: '/api/world/world-456/actor/a1/content/pages/p-new',
			response: {},
		})

		const result = await client.callTool({
			name: 'update_actor_content',
			arguments: {
				actorName: 'Gandalf',
				content: '<p>New page content.</p>',
				pageName: 'NewPage',
			},
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		const allText = texts.join('\n')

		expect(result.isError).toBeUndefined()
		expect(allText).toContain('has been created')
		expect(allText).toContain('has been updated')
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
			name: 'update_actor_content',
			arguments: {
				actorName: 'NonexistentActor',
				content: '<p>Content</p>',
			},
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error updating actor content')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'update_actor_content',
			arguments: {
				actorName: 'Gandalf',
				content: '<p>Content</p>',
			},
		})

		expect(result.isError).toBe(true)
	})
})
