import { expect, test } from '@playwright/test'
import { createNewUser, deleteAccount } from 'fixtures/auth'
import { createMcpSession } from 'fixtures/mcp'

test.describe('MCP Event Tools', () => {
	let user: Awaited<ReturnType<typeof createNewUser>>

	test.beforeEach(async ({ page }) => {
		user = await createNewUser(page)
	})

	test('creates an event with description and reads it back', async ({ page }) => {
		const mcp = await createMcpSession(page, user)

		// Create a world (automatically sets context)
		const createWorldResult = await mcp.callTool('create_world', { name: 'Event World' })
		expect(createWorldResult.isError).toBeFalsy()

		// Create an event with timestamp and description
		const createResult = await mcp.callTool('create_event', {
			name: 'The Great Battle',
			timestamp: '1440',
			description: '<p>A decisive battle that changed the course of history.</p>',
		})
		expect(createResult.isError).toBeFalsy()
		expect(createResult.content[0].text).toContain('The Great Battle')
		expect(createResult.content[0].text).toContain('1440')

		// Read the event back and verify content is persisted
		const detailsResult = await mcp.callTool('get_event_details', {
			eventName: 'The Great Battle',
		})
		expect(detailsResult.isError).toBeFalsy()
		const detailsText = detailsResult.content[0].text
		expect(detailsText).toContain('The Great Battle')
		expect(detailsText).toContain('1440')
		expect(detailsText).toContain('A decisive battle that changed the course of history.')
	})

	test.afterEach(async ({ page }) => {
		await deleteAccount(page)
	})
})
