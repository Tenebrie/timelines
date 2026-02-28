import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerDeleteArticleTool } from './deleteArticle.tool.js'

const server = setupTestServer()

describe('delete_article tool', () => {
	let client: Client

	beforeEach(async () => {
		const mcpServer = new McpServer({ name: 'test-server', version: '0.0.1' })
		registerDeleteArticleTool(mcpServer)

		const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
		await mcpServer.connect(serverTransport)

		client = new Client({ name: 'test-client', version: '0.0.1' })
		await client.connect(clientTransport)

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('deletes an article successfully', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [{ id: 'art-1', name: 'Old Lore' }],
		})

		const mock = generateEndpointMock(server, {
			method: 'delete',
			path: '/api/world/world-456/wiki/article/art-1',
			response: {},
		})

		const result = await client.callTool({
			name: 'delete_article',
			arguments: { articleName: 'Old Lore' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Old Lore')
		expect(text).toContain('deleted successfully')
		expect(text).toContain('art-1')
		expect(mock.hasBeenCalled()).toBe(true)
	})

	it('returns an error when article is not found', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		const result = await client.callTool({
			name: 'delete_article',
			arguments: { articleName: 'Nonexistent Article' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error deleting article')
	})

	it('uses fuzzy matching to find the article', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [{ id: 'art-1', name: 'Dragon Lore' }],
		})

		generateEndpointMock(server, {
			method: 'delete',
			path: '/api/world/world-456/wiki/article/art-1',
			response: {},
		})

		const result = await client.callTool({
			name: 'delete_article',
			arguments: { articleName: 'dragon' },
		})

		expect(result.isError).toBeUndefined()
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Dragon Lore')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'delete_article',
			arguments: { articleName: 'Some Article' },
		})

		expect(result.isError).toBe(true)
	})
})
