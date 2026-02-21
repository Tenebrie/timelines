import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerSetContextTool } from './setContext.tool.js'

const server = setupTestServer()

describe('set_context tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerSetContextTool(server)
		})

		ContextService.setCurrentUserId('default', 'user-123')
	})

	it('sets the world context successfully', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-789',
			response: {
				id: 'world-789',
				name: 'Narnia',
				isReadOnly: false,
				events: [],
				actors: [],
				tags: [],
			},
		})

		const result = await client.callTool({
			name: 'set_context',
			arguments: { worldId: 'world-789' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Context set successfully')
		expect(text).toContain('Narnia')
		expect(text).toContain('world-789')

		// Verify context was actually set
		expect(ContextService.getCurrentWorld('default')).toBe('world-789')
	})

	it('sets both userId and worldId when userId is provided', async () => {
		// REQUIRE_OAUTH must be 'false' to allow setting userId directly
		const originalEnv = process.env.REQUIRE_OAUTH
		process.env.REQUIRE_OAUTH = 'false'

		// Clear existing user context
		ContextService.setCurrentUserId('default', null)

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-789',
			response: {
				id: 'world-789',
				name: 'Test World',
				isReadOnly: false,
				events: [],
				actors: [],
				tags: [],
			},
		})

		const result = await client.callTool({
			name: 'set_context',
			arguments: { userId: 'new-user-456', worldId: 'world-789' },
		})

		expect(result.isError).toBeUndefined()
		expect(ContextService.getCurrentUserId('default')).toBe('new-user-456')
		expect(ContextService.getCurrentWorld('default')).toBe('world-789')

		process.env.REQUIRE_OAUTH = originalEnv
	})

	it('returns an error when world does not exist', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/nonexistent',
			error: { status: 404, message: 'World not found' },
		})

		const result = await client.callTool({
			name: 'set_context',
			arguments: { worldId: 'nonexistent' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error setting context')
	})

	it('returns an error when no user is set and no userId provided', async () => {
		ContextService.setCurrentUserId('default', null)

		const result = await client.callTool({
			name: 'set_context',
			arguments: { worldId: 'world-789' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error setting context')
	})
})
