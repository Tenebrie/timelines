import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { findByName } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
import { resolveMentions } from '@src/utils/resolveMentions.js'
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
			title: 'Get Article Details',
			description: 'Get details about a specific wiki article by name, including name and content',
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
				const userId = ContextService.getCurrentUserIdOrThrow(sessionId)
				const { articleName } = args

				const articles = await RheaService.getWorldArticles({ worldId, userId })
				const article = findByName({ name: articleName, entities: articles })

				const content = await RheaService.getArticleContent({
					worldId,
					articleId: article.id,
					userId,
				})

				const worldData = await RheaService.getWorldDetails({ worldId, userId })
				const mentionsOutput = resolveMentions({
					entity: article,
					worldData,
					articleData: articles,
				})

				Logger.toolSuccess(TOOL_NAME, `Found article "${article.name}"`)
				return {
					content: [
						{
							type: 'text' as const,
							text:
								`Article: ${article.name}\n` +
								`ID: ${article.id}\n\n` +
								`${content.contentHtml || 'No content'}`,
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
							text: `Error fetching article: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
