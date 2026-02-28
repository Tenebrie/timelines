import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerGetTagDetailsTool } from './getTagDetails.tool.js'

const server = setupTestServer()

describe('get_tag_details tool', () => {
	let client: Client

	beforeEach(async () => {
		const mcpServer = new McpServer({ name: 'test-server', version: '0.0.1' })
		registerGetTagDetailsTool(mcpServer)

		const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
		await mcpServer.connect(serverTransport)

		client = new Client({ name: 'test-client', version: '0.0.1' })
		await client.connect(clientTransport)

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('returns tag details with mentionedBy', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [],
				tags: [{ id: 'tag-1', name: 'Important' }],
			},
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/tag/tag-1',
			response: {
				id: 'tag-1',
				name: 'Important',
				description: 'Marks important items',
				mentionedBy: [
					{
						id: 'act-1',
						type: 'Actor',
						name: 'Hero',
					},
				],
			},
		})

		const result = await client.callTool({
			name: 'get_tag_details',
			arguments: { tagName: 'Important' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Tag: Important')
		expect(text).toContain('tag-1')
		expect(text).toContain('Marks important items')
		expect(text).toContain('Hero')
	})

	it('shows tag with no description or mentions', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [],
				tags: [{ id: 'tag-2', name: 'Empty Tag' }],
			},
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/tag/tag-2',
			response: {
				id: 'tag-2',
				name: 'Empty Tag',
				description: '',
				mentionedBy: [],
			},
		})

		const result = await client.callTool({
			name: 'get_tag_details',
			arguments: { tagName: 'Empty Tag' },
		})

		expect(result.isError).toBeUndefined()
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Tag: Empty Tag')
	})

	it('returns an error when tag is not found', async () => {
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
			name: 'get_tag_details',
			arguments: { tagName: 'Nonexistent Tag' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error fetching tag')
	})

	it('uses fuzzy matching to find the tag', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [],
				tags: [{ id: 'tag-1', name: 'Plot Point' }],
			},
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/tag/tag-1',
			response: {
				id: 'tag-1',
				name: 'Plot Point',
				description: '',
				mentionedBy: [],
			},
		})

		const result = await client.callTool({
			name: 'get_tag_details',
			arguments: { tagName: 'plot' },
		})

		expect(result.isError).toBeUndefined()
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Tag: Plot Point')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'get_tag_details',
			arguments: { tagName: 'Important' },
		})

		expect(result.isError).toBe(true)
	})
})
