import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { findByName } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
import { resolveShorthandMentions } from '@src/utils/resolveShorthandMentions.js'
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
			description: [
				'Update an existing wiki article by name. Find the article by name and update its properties.',

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
				const { articleName, name, content } = args

				const articleData = await RheaService.getWorldArticles({ worldId, userId })
				const article = findByName({ name: articleName, entities: articleData })

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
					const worldData = await RheaService.getWorldDetails({ worldId, userId })
					const parsedContent = await resolveShorthandMentions({
						content,
						worldData,
						articleData,
					})

					await RheaService.updateArticleContent({
						worldId,
						articleId: article.id,
						userId,
						content: parsedContent,
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
