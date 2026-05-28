import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { checkActorDoesNotExist } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
import { normalizeColor } from '@src/utils/normalizeColor.js'
import { resolveShorthandMentions } from '@src/utils/resolveShorthandMentions.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'create_actor'

const inputSchema = z.object({
	name: z.string().describe('The name of the actor'),
	title: z.string().optional().describe('The title of the actor (optional)'),
	color: z.string().optional().describe('The color of the actor in RGB hex format, e.g. #bf8a40 (optional)'),
	description: z.string().optional().describe('The description of the actor in HTML format (optional)'),
})

export function registerCreateActorTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Create Actor',
			description: [
				'Create a new actor in the current world with name, title, and description.',

				'To mention another entity in content, use the following syntax:',
				'@[Entity Name]',
				'It will be automatically resolved into an HTML tag.',

				'Content is HTML. Use <p>, <ul>, <li>, <b> etc.',
				'Mentions link entities together and show up in "Mentions" and "Mentioned in" fields.',
			].join('\n'),
			inputSchema,
		},
		async (args: z.infer<typeof inputSchema>, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, args)

				const worldId = await ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = await ContextService.getCurrentUserIdOrThrow(sessionId)
				const { name, title, color, description } = args

				await checkActorDoesNotExist({ name, userId, sessionId })

				let parsedDescription = description
				if (description) {
					const worldData = await RheaService.getWorldDetails({ worldId, userId })
					const articleData = await RheaService.getWorldArticles({ worldId, userId })
					const parsedContent = await resolveShorthandMentions({
						content: description,
						worldData,
						articleData,
					})
					parsedDescription = parsedContent
				}

				const actor = await RheaService.createActor({
					worldId,
					userId,
					name,
					title,
					color: normalizeColor(color),
					descriptionRich: parsedDescription,
				})

				Logger.toolSuccess(TOOL_NAME, `Created actor: ${actor.name} (${actor.id})`)
				return {
					content: [
						{
							type: 'text' as const,
							text:
								`Actor created successfully!\n` +
								`Name: ${actor.name}\n` +
								`ID: ${actor.id}\n` +
								`Title: ${actor.title || 'None'}\n` +
								`Color: ${actor.color || '(None)'}`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error creating actor: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
