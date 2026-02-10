import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'delete_article'

const inputSchema = z.object({
	articleName: z.string().describe('The name of the article to delete'),
})

export function registerDeleteArticleTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			description: 'Delete a wiki article by name from the current world',
			inputSchema,
		},
		async (args: z.infer<typeof inputSchema>, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, args)

				const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = ContextService.getCurrentUserIdOrThrow(sessionId)
				const { articleName } = args

				const articles = await RheaService.getWorldArticles({ worldId, userId })
				const article = articles.find((a) => a.name.toLowerCase() === articleName.toLowerCase())

				if (!article) {
					return {
						content: [
							{
								type: 'text' as const,
								text: `Article "${articleName}" not found in this world. Available articles: ${articles.map((a) => a.name).join(', ') || 'None'}`,
							},
						],
						isError: true,
					}
				}

				await RheaService.deleteArticle({
					worldId,
					articleId: article.id,
					userId,
				})

				Logger.toolSuccess(TOOL_NAME, `Deleted article "${article.name}"`)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Article "${article.name}" (ID: ${article.id}) has been deleted successfully.`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error deleting article: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
