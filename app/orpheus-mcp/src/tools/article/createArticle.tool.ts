import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { checkArticleDoesNotExist } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'create_article'

const inputSchema = z.object({
	name: z.string().describe('The name of the article'),
	content: z.string().optional().describe('The content of the article in HTML format (optional)'),
})

export function registerCreateArticleTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Create Article',
			description: 'Create a new wiki article in the current world with name and content',
			inputSchema,
		},
		async (args: z.infer<typeof inputSchema>, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, args)

				const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = ContextService.getCurrentUserIdOrThrow(sessionId)
				const { name, content } = args

				await checkArticleDoesNotExist({ name, userId, sessionId })

				const article = await RheaService.createArticle({
					worldId,
					userId,
					name,
				})

				if (content) {
					await RheaService.updateArticleContent({
						worldId,
						articleId: article.id,
						userId,
						content,
					})
				}

				Logger.toolSuccess(TOOL_NAME, `Created article "${article.name}"`)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Article created successfully!\n` + `Name: ${article.name}\n` + `ID: ${article.id}`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error creating article: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
