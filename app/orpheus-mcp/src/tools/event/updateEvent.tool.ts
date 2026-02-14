import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { findByName } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
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
	description: z.string().optional().describe('The new description in HTML format (optional)'),
})

export function registerUpdateEventTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Update Event',
			description: [
				'Update an existing event by name. Find the event by name and update its properties.',

				'To mention another entity in content, use:',
				'<span data-component-props="{&quot;actor&quot;:&quot;ACTOR_ID&quot;}" data-type="mention" data-name="Display Name"></span>',
				'<span data-component-props="{&quot;tag&quot;:&quot;TAG_ID&quot;}" data-type="mention" data-name="Tag Name"></span>',
				'Note that data-component-props is an escaped JSON string. For example: {"actor":"ACTOR_ID"}, escaped, will produce the correct format.',

				'You may also use a shorthand syntax: @[Entity Name] that will be automatically resolved into an HTML tag.',

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
				const { eventName, name, timestamp, description } = args

				const worldData = await RheaService.getWorldDetails({ worldId, userId })
				const event = findByName({ name: eventName, entities: worldData.events })

				const updatedEvent = await RheaService.updateEvent({
					worldId,
					eventId: event.id,
					userId,
					name,
					timestamp,
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
								`Timestamp: ${updatedEvent.timestamp}`,
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
