import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { findByName } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'delete_actor_content_page'

const inputSchema = z.object({
	actorName: z.string().describe('The name of the actor that owns the content page'),
	pageName: z.string().describe('The name of the content page to delete'),
})

export function registerDeleteActorContentPageTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Delete Actor Content Page',
			description: 'Delete a content page from an actor. This permanently removes the page and its content.',
			inputSchema,
			annotations: {
				destructiveHint: true,
			},
		},
		async (args: z.infer<typeof inputSchema>, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, args)

				const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = ContextService.getCurrentUserIdOrThrow(sessionId)
				const { actorName, pageName } = args

				const worldData = await RheaService.getWorldDetails({ worldId, userId })
				const actor = findByName({ name: actorName, entities: worldData.actors })

				const page = findByName({ name: pageName, entities: actor.pages })

				await RheaService.deleteActorContentPage({
					worldId,
					actorId: actor.id,
					userId,
					pageId: page.id,
				})

				Logger.toolSuccess(TOOL_NAME, `Deleted content page "${pageName}" from actor "${actorName}"`)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Content page "${pageName}" has been deleted from actor "${actor.name}".`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error deleting content page: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
