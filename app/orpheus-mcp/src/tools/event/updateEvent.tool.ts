import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { findByName } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
import { normalizeColor } from '@src/utils/normalizeColor.js'
import { resolveShorthandMentions } from '@src/utils/resolveShorthandMentions.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'update_event'

const inputSchema = z.object({
	eventName: z.string().describe('The name of the event to update'),
	name: z.string().optional().describe('The new name for the event (optional)'),
	timestamp: z
		.string()
		.optional()
		.describe(
			'The new timestamp for the event (optional), as a bigint string, in minutes. Timestamp 0 is the beginning of the story.',
		),
	color: z
		.string()
		.optional()
		.describe('The new color for the event in RGB hex format, e.g. #bf8a40 (optional)'),
	description: z
		.string()
		.optional()
		.describe(
			'The new description in HTML format (optional). If provided, fully replaces the old description.',
		),
})

export function registerUpdateEventTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Update Event',
			description: [
				'Update an existing event by name. Find the event by name and update its properties.',

				'To mention another entity in content, use the following syntax:',
				'@[Entity Name]',
				'It will be automatically resolved into an HTML tag.',

				'Content is HTML. Use <p>, <ul>, <li>, <b> etc.',
				'Mentions link entities together and show up in "Mentions" and "Mentioned in" fields.',
			].join('\n'),
			inputSchema,
			annotations: {
				idempotentHint: true,
			},
		},
		async (args: z.infer<typeof inputSchema>, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, args)

				const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = ContextService.getCurrentUserIdOrThrow(sessionId)
				const { eventName, name, timestamp, color, description } = args

				const worldData = await RheaService.getWorldDetails({ worldId, userId })
				const event = findByName({ name: eventName, entities: worldData.events })

				const updatedEvent = await RheaService.updateEvent({
					worldId,
					eventId: event.id,
					userId,
					name,
					timestamp,
					color: normalizeColor(color),
				})

				if (description !== undefined) {
					const articleData = await RheaService.getWorldArticles({ userId, worldId })
					const parsedContent = await resolveShorthandMentions({
						content: description,
						worldData,
						articleData,
					})

					await RheaService.updateEventContent({
						worldId,
						eventId: event.id,
						userId,
						content: parsedContent,
					})
				}

				Logger.toolSuccess(TOOL_NAME, `Updated event "${updatedEvent.name}"`)
				return {
					content: [
						{
							type: 'text' as const,
							text:
								`Event updated successfully!\n` +
								`Name: ${updatedEvent.name}\n` +
								`ID: ${updatedEvent.id}\n` +
								`Timestamp: ${updatedEvent.timestamp}\n` +
								`Color: ${updatedEvent.color || '(None)'}`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error updating event: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
