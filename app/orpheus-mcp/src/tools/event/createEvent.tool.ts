import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'create_event'

const inputSchema = z.object({
	name: z.string().optional().describe('The name of the event (optional, auto-generated if not provided)'),
	timestamp: z.string().describe('The timestamp of the event (as a bigint string)'),
	description: z.string().optional().describe('The description of the event in HTML format (optional)'),
})

export function registerCreateEventTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			description: 'Create a new event in the current world with name, timestamp, and description',
			inputSchema,
		},
		async (args: z.infer<typeof inputSchema>, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, args)

				const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = ContextService.getCurrentUserIdOrThrow(sessionId)
				const { name, timestamp, description } = args

				const event = await RheaService.createEvent({
					worldId,
					userId,
					name,
					timestamp,
					descriptionRich: description || '',
				})

				Logger.toolSuccess(TOOL_NAME, `Created event: ${event.name} (${event.id})`)
				return {
					content: [
						{
							type: 'text' as const,
							text:
								`Event created successfully!\n` +
								`Name: ${event.name}\n` +
								`ID: ${event.id}\n` +
								`Timestamp: ${event.timestamp}`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error creating event: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
