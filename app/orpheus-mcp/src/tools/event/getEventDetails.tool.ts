import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'get_event_details'

const inputSchema = z.object({
	eventName: z.string().describe('The name of the event to find'),
})

export function registerGetEventDetailsTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			description: 'Get details about a specific event by name, including name, timestamp, and description',
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

				const content = await RheaService.getEventContent({
					worldId,
					eventId: event.id,
					userId,
				})

				Logger.toolSuccess(TOOL_NAME, `Found event: ${event.name}`)
				return {
					content: [
						{
							type: 'text' as const,
							text:
								`Event: ${event.name}\n` +
								`ID: ${event.id}\n` +
								`Timestamp: ${event.timestamp}\n` +
								`Description: ${content.contentHtml || 'No description'}`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error fetching event: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
