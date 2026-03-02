import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerUpdateTagTool } from './updateTag.tool.js'

const server = setupTestServer()

describe('update_tag tool', () => {
	let client: Client

	beforeEach(async () => {
		const mcpServer = new McpServer({ name: 'test-server', version: '0.0.1' })
		registerUpdateTagTool(mcpServer)

		const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
		await mcpServer.connect(serverTransport)

		client = new Client({ name: 'test-client', version: '0.0.1' })
		await client.connect(clientTransport)

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('updates a tag name', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [],
				tags: [{ id: 'tag-1', name: 'Old Tag' }],
			},
		})

		const mock = generateEndpointMock(server, {
			method: 'patch',
			path: '/api/world/world-456/tag/tag-1',
			response: {
				id: 'tag-1',
				name: 'New Tag',
			},
		})

		const result = await client.callTool({
			name: 'update_tag',
			arguments: { tagName: 'Old Tag', name: 'New Tag' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Tag updated successfully')
		expect(text).toContain('New Tag')
		expect(mock.hasBeenCalled()).toBe(true)
	})

	it('updates a tag description', async () => {
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

		const mock = generateEndpointMock(server, {
			method: 'patch',
			path: '/api/world/world-456/tag/tag-1',
			response: {
				id: 'tag-1',
				name: 'Important',
				description: 'Updated description',
			},
		})

		const result = await client.callTool({
			name: 'update_tag',
			arguments: {
				tagName: 'Important',
				description: 'Updated description',
			},
		})

		expect(result.isError).toBeUndefined()
		expect(mock.hasBeenCalled()).toBe(true)
	})

	it('updates both name and description', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [],
				tags: [{ id: 'tag-1', name: 'Old' }],
			},
		})

		generateEndpointMock(server, {
			method: 'patch',
			path: '/api/world/world-456/tag/tag-1',
			response: {
				id: 'tag-1',
				name: 'Renamed',
				description: 'New desc',
			},
		})

		const result = await client.callTool({
			name: 'update_tag',
			arguments: {
				tagName: 'Old',
				name: 'Renamed',
				description: 'New desc',
			},
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(result.isError).toBeUndefined()
		expect(text).toContain('Renamed')
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
			name: 'update_tag',
			arguments: { tagName: 'Nonexistent', name: 'New name' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error updating tag')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'update_tag',
			arguments: { tagName: 'Tag', name: 'New name' },
		})

		expect(result.isError).toBe(true)
	})
})
