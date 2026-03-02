import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerCreateArticleTool } from './createArticle.tool.js'

const server = setupTestServer()

describe('create_article tool', () => {
	let client: Client

	beforeEach(async () => {
		const mcpServer = new McpServer({ name: 'test-server', version: '0.0.1' })
		registerCreateArticleTool(mcpServer)

		const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
		await mcpServer.connect(serverTransport)

		client = new Client({ name: 'test-client', version: '0.0.1' })
		await client.connect(clientTransport)

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('creates an article with name only', async () => {
		// checkArticleDoesNotExist calls getWorldArticles
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		const mock = generateEndpointMock(server, {
			method: 'post',
			path: '/api/world/world-456/wiki/articles',
			response: {
				id: 'art-new',
				name: 'Magic System',
			},
		})

		const result = await client.callTool({
			name: 'create_article',
			arguments: { name: 'Magic System' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Article created successfully')
		expect(text).toContain('Magic System')
		expect(text).toContain('art-new')
		expect(mock.hasBeenCalled()).toBe(true)
	})

	it('creates an article with content', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

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
			path: '/api/world/world-456/wiki/articles',
			response: {
				id: 'art-content',
				name: 'Lore',
			},
		})

		const result = await client.callTool({
			name: 'create_article',
			arguments: {
				name: 'Lore',
				content: '<p>Ancient knowledge of the world.</p>',
			},
		})

		expect(result.isError).toBeUndefined()
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Lore')
	})

	it('returns error when article already exists', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [{ id: 'art-1', name: 'Magic System' }],
		})

		const result = await client.callTool({
			name: 'create_article',
			arguments: { name: 'Magic System' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('already exists')
	})

	it('returns an error when the API call fails', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		generateEndpointMock(server, {
			method: 'post',
			path: '/api/world/world-456/wiki/articles',
			error: { status: 500, message: 'Server error' },
		})

		const result = await client.callTool({
			name: 'create_article',
			arguments: { name: 'Failing Article' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error creating article')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'create_article',
			arguments: { name: 'No World Article' },
		})

		expect(result.isError).toBe(true)
	})
})
