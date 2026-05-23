import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { checkEventDoesNotExist } from '@src/utils/findByName.js'
import { formatTimestamp } from '@src/utils/formatTimestamp.js'
import { Logger } from '@src/utils/Logger.js'
import { normalizeColor } from '@src/utils/normalizeColor.js'
import { resolveDateTime } from '@src/utils/resolveDateTime.js'
import { resolveShorthandMentions } from '@src/utils/resolveShorthandMentions.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'create_event'

const inputSchema = z.object({
	name: z.string().describe('The name of the event'),
	dateTime: z
		.string()
		.describe('The date and time of the event. The format must match the current world precisely.'),
	color: z.string().optional().describe('The color of the event in RGB hex format, e.g. #bf8a40 (optional)'),
	description: z.string().optional().describe('The description of the event in HTML format (optional)'),
})

export function registerCreateEventTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Create Event',
			description: 'Create a new event in the current world.',
			inputSchema,
		},
		async (args: z.infer<typeof inputSchema>, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, args)

				const worldId = await ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = await ContextService.getCurrentUserIdOrThrow(sessionId)
				const { name, dateTime, color, description } = args

				await checkEventDoesNotExist({ name, userId, sessionId })
				const worldData = await RheaService.getWorldDetails({ worldId, userId })

				let parsedDescription = description
				if (description) {
					const articleData = await RheaService.getWorldArticles({ worldId, userId })
					const parsedContent = await resolveShorthandMentions({
						content: description,
						worldData,
						articleData,
					})
					parsedDescription = parsedContent
				}

				const event = await RheaService.createEvent({
					worldId,
					userId,
					name,
					timestamp: resolveDateTime(dateTime, worldData),
					color: normalizeColor(color),
					descriptionRich: parsedDescription || '',
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
								`Timestamp: ${formatTimestamp(event.timestamp, worldData)}\n` +
								`Color: ${event.color || '(None)'}`,
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
