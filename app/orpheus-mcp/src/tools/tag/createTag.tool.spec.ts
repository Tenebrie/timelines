import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerCreateTagTool } from './createTag.tool.js'

const server = setupTestServer()

describe('create_tag tool', () => {
	let client: Client

	beforeEach(async () => {
		const mcpServer = new McpServer({ name: 'test-server', version: '0.0.1' })
		registerCreateTagTool(mcpServer)

		const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
		await mcpServer.connect(serverTransport)

		client = new Client({ name: 'test-client', version: '0.0.1' })
		await client.connect(clientTransport)

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('creates a tag with name only', async () => {
		// checkTagDoesNotExist calls getWorldDetails
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
			path: '/api/world/world-456/tags',
			response: {
				id: 'tag-new',
				name: 'Important',
			},
		})

		const result = await client.callTool({
			name: 'create_tag',
			arguments: { name: 'Important' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Tag created successfully')
		expect(text).toContain('Important')
		expect(mock.hasBeenCalled()).toBe(true)
	})

	it('creates a tag with description', async () => {
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
			path: '/api/world/world-456/tags',
			response: {
				id: 'tag-desc',
				name: 'Plot Point',
				description: 'A major story element',
			},
		})

		const result = await client.callTool({
			name: 'create_tag',
			arguments: {
				name: 'Plot Point',
				description: 'A major story element',
			},
		})

		expect(result.isError).toBeUndefined()
		expect(mock.hasBeenCalled()).toBe(true)
	})

	it('returns error when tag already exists', async () => {
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

		const result = await client.callTool({
			name: 'create_tag',
			arguments: { name: 'Important' },
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
			path: '/api/world/world-456/tags',
			error: { status: 500, message: 'Server error' },
		})

		const result = await client.callTool({
			name: 'create_tag',
			arguments: { name: 'Failing Tag' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error creating tag')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'create_tag',
			arguments: { name: 'No World Tag' },
		})

		expect(result.isError).toBe(true)
	})
})
