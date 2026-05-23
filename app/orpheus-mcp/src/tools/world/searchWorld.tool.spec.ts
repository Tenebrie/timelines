import { Client } from '@modelcontextprotocol/sdk/client'
import { ContextService } from '@src/services/ContextService.js'
import { setupMockClient } from '@src/test-utils/setupMockClient.js'
import { setupTestServer } from '@src/test-utils/setupTestServer.js'
import { beforeEach, describe, expect, it } from 'vitest'

import { generateEndpointMock } from '../../test-utils/generateEndpointMock.js'
import { mockNumericCalendar } from '../../test-utils/mockCalendar.js'
import { registerSearchWorldTool } from './searchWorld.tool.js'

const server = setupTestServer()

const worldDetailsResponse = {
	id: 'world-456',
	name: 'Test World',
	isReadOnly: false,
	calendars: [mockNumericCalendar()],
	events: [
		{ id: 'e-start', name: 'War Begins', timestamp: '100', mentions: [], mentionedIn: [] },
		{ id: 'e-end', name: 'War Ends', timestamp: '900', mentions: [], mentionedIn: [] },
	],
	actors: [],
	tags: [],
}

const mockWorldDetails = () =>
	generateEndpointMock(server, {
		method: 'get',
		path: '/api/world/world-456',
		response: worldDetailsResponse,
	})

const emptyResults = { events: [], actors: [], articles: [], tags: [] }

describe('search_world tool', () => {
	let client: Client

	beforeEach(async () => {
		client = await setupMockClient((server) => {
			registerSearchWorldTool(server)
		})

		// Set up session context so the tool can find worldId and userId
		await ContextService.setCurrentUserId('default', 'user-123')
		ContextService.setCurrentWorld('default', 'world-456')
	})

	it('returns formatted search results', async () => {
		mockWorldDetails()
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/search/dragon',
			response: {
				events: [{ id: 'e1', name: 'Dragon Attack' }],
				actors: [{ id: 'a1', name: 'Red Dragon' }],
				articles: [{ id: 'ar1', name: 'Dragon Lore' }],
				tags: [],
			},
		})

		const result = await client.callTool({
			name: 'search_world',
			arguments: { query: 'dragon' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(text).toContain('Dragon Attack')
		expect(text).toContain('Red Dragon')
		expect(text).toContain('Dragon Lore')
		expect(text).toContain('No tags found')
	})

	it('returns empty results when nothing matches', async () => {
		mockWorldDetails()
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/search/nonexistent',
			response: emptyResults,
		})

		const result = await client.callTool({
			name: 'search_world',
			arguments: { query: 'nonexistent' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(text).toContain('No events found')
		expect(text).toContain('No actors found')
		expect(text).toContain('No articles found')
		expect(text).toContain('No tags found')
	})

	it('returns an error when the API call fails', async () => {
		mockWorldDetails()
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/search/broken',
			error: { status: 500, message: 'Internal server error' },
		})

		const result = await client.callTool({
			name: 'search_world',
			arguments: { query: 'broken' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('Error searching world')
	})

	it('returns an error when no world is set', async () => {
		// Clear world context
		ContextService.setCurrentWorld('default', null)

		const result = await client.callTool({
			name: 'search_world',
			arguments: { query: 'anything' },
		})

		expect(result.isError).toBe(true)
		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('No world set')
	})

	it('includes multiple results per category', async () => {
		mockWorldDetails()
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/search/battle',
			response: {
				events: [
					{ id: 'e1', name: 'First Battle' },
					{ id: 'e2', name: 'Second Battle' },
					{ id: 'e3', name: 'Final Battle' },
				],
				actors: [
					{ id: 'a1', name: 'Battle Mage' },
					{ id: 'a2', name: 'Battle Commander' },
				],
				articles: [],
				tags: [{ id: 't1', name: 'Battle-related' }],
			},
		})

		const result = await client.callTool({
			name: 'search_world',
			arguments: { query: 'battle' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text

		expect(text).toContain('First Battle')
		expect(text).toContain('Second Battle')
		expect(text).toContain('Final Battle')
		expect(text).toContain('Battle Mage')
		expect(text).toContain('Battle Commander')
		expect(text).toContain('Battle-related')
		expect(text).toContain('No articles found')
	})

	it('formats event timestamps and summarizes content in the results', async () => {
		mockWorldDetails()
		generateEndpointMock(server, {
			method: 'get',
			path: '/api/world/world-456/search/siege',
			response: {
				events: [
					{
						id: 'e1',
						name: 'The Siege',
						timestamp: '250',
						descriptionRich: '<p>The city was besieged for forty days.</p>',
					},
				],
				actors: [],
				articles: [],
				tags: [],
			},
		})

		const result = await client.callTool({
			name: 'search_world',
			arguments: { query: 'siege' },
		})

		const text = (result.content as Array<{ type: string; text: string }>)[0].text
		expect(text).toContain('The Siege (250)')
		expect(text).toContain('The city was besieged for forty days.')
	})

	describe('time range filtering', () => {
		it('passes from/to dates as minTime/maxTime query params', async () => {
			mockWorldDetails()
			const searchMock = generateEndpointMock(server, {
				method: 'get',
				path: '/api/world/world-456/search/war',
				response: emptyResults,
			})

			await client.callTool({
				name: 'search_world',
				arguments: { query: 'war', from: '100', to: '500' },
			})

			expect(searchMock.hasBeenCalled()).toBe(true)
			expect(searchMock.invocations[0].searchParams).toMatchObject({
				minTime: '100',
				maxTime: '500',
			})
		})

		it('resolves "after" to the lower bound and "before" to the upper bound', async () => {
			mockWorldDetails()
			const searchMock = generateEndpointMock(server, {
				method: 'get',
				path: '/api/world/world-456/search/war',
				response: emptyResults,
			})

			await client.callTool({
				name: 'search_world',
				arguments: { query: 'war', after: 'War Begins', before: 'War Ends' },
			})

			expect(searchMock.hasBeenCalled()).toBe(true)
			expect(searchMock.invocations[0].searchParams).toMatchObject({
				minTime: '100',
				maxTime: '900',
			})
		})

		it('rejects combining "from" and "after" (both set the start)', async () => {
			const result = await client.callTool({
				name: 'search_world',
				arguments: { query: 'war', from: '100', after: 'War Begins' },
			})

			expect(result.isError).toBe(true)
			const text = (result.content as Array<{ type: string; text: string }>)[0].text
			expect(text).toContain('Cannot search for both "from" and "after"')
		})

		it('rejects combining "to" and "before" (both set the end)', async () => {
			const result = await client.callTool({
				name: 'search_world',
				arguments: { query: 'war', to: '500', before: 'War Ends' },
			})

			expect(result.isError).toBe(true)
			const text = (result.content as Array<{ type: string; text: string }>)[0].text
			expect(text).toContain('Cannot search for both "to" and "before"')
		})

		it('rejects a range whose start is after its end', async () => {
			mockWorldDetails()

			const result = await client.callTool({
				name: 'search_world',
				arguments: { query: 'war', from: '500', to: '100' },
			})

			expect(result.isError).toBe(true)
			const text = (result.content as Array<{ type: string; text: string }>)[0].text
			expect(text).toContain('Minimum time must be before maximum time')
		})
	})
})
