import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { findByName } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
import { resolveMentions } from '@src/utils/resolveMentions.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'get_actor_details'

const inputSchema = z.object({
	actorName: z.string().describe('The name of the actor to find'),
	pageName: z
		.string()
		.optional()
		.describe('The page of the actor content to fetch, if not provided, the main content will be fetched'),
})

export function registerGetActorDetailsTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Get Actor Details',
			description: [
				'Fetches actor info. Use pageName to get a specific page (e.g., "knowledge", "relationships").',
				'Without pageName, returns main content.',
				'Shows list of available pages at the bottom. If the specified page does not exist, an error will be returned.',
			].join('\n'),
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

				const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
				const { actorName } = args

				const userId = ContextService.getCurrentUserIdOrThrow(sessionId)
				const worldData = await RheaService.getWorldDetails({
					worldId,
					userId,
				})
				const articleData = await RheaService.getWorldArticles({ worldId, userId })

				const actor = findByName({ name: actorName, entities: worldData.actors })
				const page = args.pageName ? findByName({ name: args.pageName, entities: actor.pages }) : undefined

				const content = await RheaService.getActorContent({
					worldId,
					actorId: actor.id,
					userId,
					pageId: page?.id,
				})

				const mentionsOutput = resolveMentions({
					entity: actor,
					worldData,
					articleData,
				})

				Logger.toolSuccess(TOOL_NAME, `Found actor: ${actor.name}`)
				return {
					content: [
						{
							type: 'text' as const,
							text:
								`Actor: ${actor.name}\n` +
								`ID: ${actor.id}\n` +
								`Title: ${actor.title || '(None)'}\n` +
								`Page: ${page?.name || '(Main content)'}\n\n` +
								`${content.contentHtml || '(No content provided)'}`,
						},
						{
							type: 'text' as const,
							text:
								'Pages: ' +
								actor.pages.map((page) => `"${page.name}"`).join(`, `) +
								(actor.pages.length === 0 ? ' (None)' : ''),
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
							text: `Error fetching actor details: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
