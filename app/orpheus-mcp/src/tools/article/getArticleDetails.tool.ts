import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'get_article_details'

const inputSchema = z.object({
	articleName: z.string().describe('The name of the article to find'),
})

export function registerGetArticleDetailsTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			description: 'Get details about a specific wiki article by name, including name and content',
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

				const content = await RheaService.getArticleContent({
					worldId,
					articleId: article.id,
					userId,
				})

				Logger.toolSuccess(TOOL_NAME, `Found article "${article.name}"`)
				return {
					content: [
						{
							type: 'text' as const,
							text:
								`Article: ${article.name}\n` +
								`ID: ${article.id}\n` +
								`Content: ${content.contentHtml || 'No content'}`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error fetching article: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
