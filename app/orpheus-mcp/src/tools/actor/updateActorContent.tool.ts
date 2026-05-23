import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { findByName, findByNameOrCreate } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
import { resolveShorthandMentions } from '@src/utils/resolveShorthandMentions.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'update_actor_content'

const inputSchema = z.object({
	actorName: z.string().describe('The name of the actor to update'),
	content: z.string().describe('The new full page content in HTML format. Fully replaces the old content.'),
	pageName: z
		.string()
		.optional()
		.describe(
			'The page of the actor content to create or update, if not provided, the main content will be updated',
		),
})

export function registerUpdateActorContentTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Update Actor Content',
			description: [
				"Updates actor content. Use pageName to target a specific page - creates it if it doesn't exist.",
				'Without pageName, updates main content.',

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
				const { actorName, content, pageName } = args

				const worldData = await RheaService.getWorldDetails({ worldId, userId })
				const actor = findByName({ name: actorName, entities: worldData.actors })

				const articleData = await RheaService.getWorldArticles({ userId, worldId })
				const parsedContent = await resolveShorthandMentions({
					content,
					worldData,
					articleData,
				})

				const result: string[] = []
				if (pageName) {
					const page = await findByNameOrCreate({
						name: pageName,
						entities: actor.pages,
						onCreate: async () => {
							const newPage = await RheaService.createActorContentPage({
								worldId,
								actorId: actor.id,
								userId,
								pageName,
							})
							result.push(`Page "${newPage.name}" has been created.`)
							return newPage
						},
					})
					const pageId = page.id
					await RheaService.updateActorContentPage({
						worldId,
						actorId: actor.id,
						userId,
						content: parsedContent,
						pageId,
					})
					result.push(`Page "${pageName}" has been updated.`)
				} else {
					await RheaService.updateActorContent({
						worldId,
						actorId: actor.id,
						userId,
						content: parsedContent,
					})
					result.push(`Main content has been updated.`)
				}

				Logger.toolSuccess(TOOL_NAME, `Updated actor content: ${actorName}`)
				return {
					content: result.map((message) => ({
						type: 'text' as const,
						text: message,
					})),
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error updating actor content: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
