import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerGetArticleDetailsTool } from './getArticleDetails.tool.js'

const server = setupTestServer()

const articlesResponse = [
	{
		id: 'art-1',
		name: 'Magic System',
		mentions: [{ targetId: 'a1' }],
		mentionedIn: [],
	},
	{
		id: 'art-2',
		name: 'History',
		mentions: [],
		mentionedIn: [{ sourceId: 'art-1' }],
	},
]

describe('get_article_details tool', () => {
	let client: Client

	beforeEach(async () => {
		const mcpServer = new McpServer({ name: 'test-server', version: '0.0.1' })
		registerGetArticleDetailsTool(mcpServer)

		const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
		await mcpServer.connect(serverTransport)

		client = new Client({ name: 'test-client', version: '0.0.1' })
		await client.connect(clientTransport)

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('returns article details with content', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: articlesResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/article/art-1/content',
			response: {
				contentHtml: '<p>The magic system is based on elemental forces.</p>',
			},
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [{ id: 'a1', name: 'Wizard', title: '' }],
				tags: [],
			},
		})

		const result = await client.callTool({
			name: 'get_article_details',
			arguments: { articleName: 'Magic System' },
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		const allText = texts.join('\n')

		expect(result.isError).toBeUndefined()
		expect(allText).toContain('Article: Magic System')
		expect(allText).toContain('ID: art-1')
		expect(allText).toContain('The magic system is based on elemental forces.')
	})

	it('shows No content when article is empty', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: articlesResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/article/art-2/content',
			response: { contentHtml: '' },
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

		const result = await client.callTool({
			name: 'get_article_details',
			arguments: { articleName: 'History' },
		})

		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		expect(texts[0]).toContain('No content')
	})

	it('returns an error when article is not found', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: articlesResponse,
		})

		const result = await client.callTool({
			name: 'get_article_details',
			arguments: { articleName: 'Nonexistent Article' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error fetching article')
	})

	it('uses fuzzy matching', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: articlesResponse,
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/article/art-1/content',
			response: { contentHtml: '' },
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

		const result = await client.callTool({
			name: 'get_article_details',
			arguments: { articleName: 'magic' },
		})

		expect(result.isError).toBeUndefined()
		const texts = (result.content as Array<{ type: string; text: string }>).map((c) => c.text)
		expect(texts[0]).toContain('Article: Magic System')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'get_article_details',
			arguments: { articleName: 'Magic System' },
		})

		expect(result.isError).toBe(true)
	})
})
