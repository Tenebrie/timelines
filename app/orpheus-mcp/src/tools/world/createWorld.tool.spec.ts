import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerCreateWorldTool } from './createWorld.tool.js'

const server = setupTestServer()

describe('create_world tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerCreateWorldTool(server)
		})
		ContextService.setCurrentUserId('default', 'user-123')
	})

	it('creates a world and sets it as current context', async () => {
		const mock = generateEndpointMock(server, {
			method: 'post',
			path: '/api/worlds',
			response: {
				id: 'new-world-id',
				name: 'New Fantasy World',
			},
		})

		const result = await client.callTool({
			name: 'create_world',
			arguments: { name: 'New Fantasy World' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('World created successfully')
		expect(text).toContain('New Fantasy World')
		expect(text).toContain('new-world-id')
		expect(text).toContain('automatically set as your current context')
		expect(mock.hasBeenCalled()).toBe(true)
		expect(ContextService.getCurrentWorld('default')).toBe('new-world-id')
	})

	it('creates a world with a description', async () => {
		const mock = generateEndpointMock(server, {
			method: 'post',
			path: '/api/worlds',
			response: {
				id: 'w-desc',
				name: 'Described World',
			},
		})

		const result = await client.callTool({
			name: 'create_world',
			arguments: {
				name: 'Described World',
				description: 'A world with rich lore and history',
			},
		})

		expect(result.isError).toBeUndefined()
		expect(mock.hasBeenCalled()).toBe(true)
		expect(mock.invocations[0].jsonBody).toMatchObject({
			name: 'Described World',
			description: 'A world with rich lore and history',
		})
	})

	it('returns an error when the API call fails', async () => {
		generateEndpointMock(server, {
			method: 'post',
			path: '/api/worlds',
			error: { status: 500, message: 'Server error' },
		})

		const result = await client.callTool({
			name: 'create_world',
			arguments: { name: 'Failing World' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error creating world')
	})

	it('returns an error when no user is set', async () => {
		ContextService.setCurrentUserId('default', null)

		const result = await client.callTool({
			name: 'create_world',
			arguments: { name: 'No User World' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error creating world')
	})
})
