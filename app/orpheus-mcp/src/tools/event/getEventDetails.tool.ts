import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { findByName } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
import { resolveSavedMentions } from '@src/utils/resolveSavedMentions.js'
import { toAgentReadableText } from '@src/utils/toAgentReadableText.js'
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
			title: 'Get Event Details',
			description: 'Get details about a specific event by name, including name, timestamp, and description',
			inputSchema,
			annotations: {
				readOnlyHint: true,
				idempotentHint: true,
			},
		},
		async (args: z.infer<typeof inputSchema>, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, args)

				const worldId = await ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = await ContextService.getCurrentUserIdOrThrow(sessionId)
				const { eventName } = args

				const worldData = await RheaService.getWorldDetails({ worldId, userId })
				const event = findByName({ name: eventName, entities: worldData.events })

				const rawContent = await RheaService.getEventContent({
					worldId,
					eventId: event.id,
					userId,
				})

				const articleData = await RheaService.getWorldArticles({ worldId, userId })
				const mentionsOutput = resolveSavedMentions({
					entity: event,
					worldData,
					articleData,
				})
				const content = toAgentReadableText({
					content: rawContent.contentHtml ?? '',
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
								`Color: ${event.color || '(None)'}\n\n` +
								`${content || 'No content'}`,
						},
						...mentionsOutput,
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
