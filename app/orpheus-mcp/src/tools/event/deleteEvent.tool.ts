import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'delete_event'

const inputSchema = z.object({
	eventName: z.string().describe('The name of the event to delete'),
})

export function registerDeleteEventTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			description: 'Delete an event by name from the current world',
			inputSchema,
		},
		async (args: z.infer<typeof inputSchema>, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, args)

				const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = ContextService.getCurrentUserIdOrThrow(sessionId)
				const { eventName } = args

				const worldData = await RheaService.getWorldDetails({ worldId, userId })
				const event = worldData.events.find((e) => e.name.toLowerCase() === eventName.toLowerCase())

				if (!event) {
					return {
						content: [
							{
								type: 'text' as const,
								text: `Event "${eventName}" not found in this world. Available events: ${worldData.events.map((e) => e.name).join(', ') || 'None'}`,
							},
						],
						isError: true,
					}
				}

				await RheaService.deleteEvent({
					worldId,
					eventId: event.id,
					userId,
				})

				Logger.toolSuccess(TOOL_NAME, `Deleted event "${event.name}"`)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Event "${event.name}" (ID: ${event.id}) has been deleted successfully.`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error deleting event: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
