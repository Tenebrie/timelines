import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerGetContextTool } from './getContext.tool.js'

const server = setupTestServer()

describe('get_context tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerGetContextTool(server)
		})
	})

	it('returns prompt to set user when no user is set', async () => {
		const result = await client.callTool({
			name: 'get_context',
			arguments: {},
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('No user currently selected')
		expect(text).toContain('set_context')
	})

	it('returns prompt to select a world when user is set but no world', async () => {
		ContextService.setCurrentUserId('default', 'user-123')

		const result = await client.callTool({
			name: 'get_context',
			arguments: {},
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('No world is currently selected')
		expect(text).toContain('list_worlds')
		expect(text).toContain('set_context')
	})

	it('returns world details when user and world are set', async () => {
		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Middle Earth',
				isReadOnly: false,
				events: [{ name: 'Council of Elrond' }, { name: 'Battle of Helms Deep' }],
				actors: [{ name: 'Aragorn' }, { name: 'Gandalf' }, { name: 'Frodo' }],
				tags: [],
			},
		})

		const result = await client.callTool({
			name: 'get_context',
			arguments: {},
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Middle Earth')
		expect(text).toContain('world-456')
		expect(text).toContain('Read-Write')
		expect(text).toContain('Events: 2')
		expect(text).toContain('Actors: 3')
	})

	it('shows Read-Only for read-only worlds', async () => {
		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Locked World',
				isReadOnly: true,
				events: [],
				actors: [],
				tags: [],
			},
		})

		const result = await client.callTool({
			name: 'get_context',
			arguments: {},
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Read-Only')
	})

	it('clears context and returns error when world fetch fails', async () => {
		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			error: { status: 404, message: 'World not found' },
		})

		const result = await client.callTool({
			name: 'get_context',
			arguments: {},
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error fetching current context')
		expect(text).toContain('Context has been cleared')

		// Verify context was actually cleared
		expect(ContextService.getCurrentWorld('default')).toBeNull()
	})
})
