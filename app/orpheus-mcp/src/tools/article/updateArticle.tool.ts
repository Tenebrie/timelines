import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { findByName } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'update_article'

const inputSchema = z.object({
	articleName: z.string().describe('The name of the article to update'),
	name: z.string().optional().describe('The new name for the article (optional)'),
	content: z.string().optional().describe('The new content in HTML format (optional)'),
})

export function registerUpdateArticleTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Update Article',
			description:
				'Update an existing wiki article by name. Find the article by name and update its properties.',
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
				const { articleName, name, content } = args

				const articles = await RheaService.getWorldArticles({ worldId, userId })
				const article = findByName({ name: articleName, entities: articles })

				let updatedName = article.name
				if (name !== undefined) {
					const updatedArticle = await RheaService.updateArticle({
						worldId,
						articleId: article.id,
						userId,
						name,
					})
					updatedName = updatedArticle.name
				}

				if (content !== undefined) {
					await RheaService.updateArticleContent({
						worldId,
						articleId: article.id,
						userId,
						content,
					})
				}

				Logger.toolSuccess(TOOL_NAME, `Updated article "${updatedName}"`)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Article updated successfully!\n` + `Name: ${updatedName}\n` + `ID: ${article.id}`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error updating article: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
