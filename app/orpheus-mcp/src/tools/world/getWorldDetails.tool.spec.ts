import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { registerGetWorldDetailsTool } from './getWorldDetails.tool.js'

const server = setupTestServer()

describe('get_world_details tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerGetWorldDetailsTool(server)
		})

		ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('returns world details with events, actors, articles, and tags', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Test World',
				isReadOnly: false,
				events: [{ name: 'Battle of Dawn' }, { name: 'Peace Treaty' }],
				actors: [
					{ name: 'Hero', title: 'The Brave' },
					{ name: 'Villain', title: 'The Dark One' },
				],
				tags: [{ name: 'Important' }],
			},
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [{ name: 'History of the Realm' }, { name: 'Magic System' }],
		})

		const result = await client.callTool({
			name: 'get_world_details',
			arguments: {},
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(result.isError).toBeUndefined()
		expect(text).toContain('Battle of Dawn')
		expect(text).toContain('Peace Treaty')
		expect(text).toContain('Hero (The Brave)')
		expect(text).toContain('Villain (The Dark One)')
		expect(text).toContain('History of the Realm')
		expect(text).toContain('Magic System')
		expect(text).toContain('Important')
		expect(text).toContain('Read-Only: No')
	})

	it('returns None for empty entity lists', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Empty World',
				isReadOnly: false,
				events: [],
				actors: [],
				tags: [],
			},
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		const result = await client.callTool({
			name: 'get_world_details',
			arguments: {},
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(text).toContain('Events: None')
		expect(text).toContain('Actors: None')
		expect(text).toContain('Articles: None')
		expect(text).toContain('Tags: None')
	})

	it('shows Read-Only: Yes for read-only worlds', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			response: {
				id: 'world-456',
				name: 'Read Only World',
				isReadOnly: true,
				events: [],
				actors: [],
				tags: [],
			},
		})

		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/wiki/articles',
			response: [],
		})

		const result = await client.callTool({
			name: 'get_world_details',
			arguments: {},
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Read-Only: Yes')
	})

	it('returns an error when no world is set', async () => {
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'get_world_details',
			arguments: {},
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error fetching world details')
	})

	it('returns an error when no user is set', async () => {
		// Clear world first while userId is still set, then clear userId
		ContextService.setCurrentWorld('default', null)
		ContextService.setCurrentUserId('default', null)

		const result = await client.callTool({
			name: 'get_world_details',
			arguments: {},
		})

		expect(result.isError).toBe(true)
	})

	it('returns an error when the API call fails', async () => {
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456',
			error: { status: 500, message: 'Server error' },
		})

		const result = await client.callTool({
			name: 'get_world_details',
			arguments: {},
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error fetching world details')
	})
})
