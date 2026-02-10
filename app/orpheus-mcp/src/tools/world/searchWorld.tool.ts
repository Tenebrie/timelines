import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'search_world'

const inputSchema = z.object({
	query: z.string().describe('The search query to find events, actors, and articles'),
})

export function registerSearchWorldTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Search World',
			description: 'Search for events, actors, and articles in the current world',
			inputSchema,
			annotations: {
				readOnlyHint: true,
				idempotentHint: true,
			},
		},
		async (args, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, { query: args.query })

				const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = ContextService.getCurrentUserIdOrThrow(sessionId)

				const data = await RheaService.searchWorld({ worldId, query: args.query, userId })

				const formatResults = (items: Array<{ id: string; name: string }>, type: string) => {
					if (items.length === 0) return `No ${type} found`
					return items.map((item) => `- ${item.name} (ID: ${item.id})`).join('\n')
				}

				const content = [
					`Search results for "${args.query}":`,
					'',
					'**Events:**',
					formatResults(data.events, 'events'),
					'',
					'**Actors:**',
					formatResults(data.actors, 'actors'),
					'',
					'**Articles:**',
					formatResults(data.articles, 'articles'),
				].join('\n')

				const totalResults = data.events.length + data.actors.length + data.articles.length
				Logger.toolSuccess(TOOL_NAME, `Found ${totalResults} results for query "${args.query}"`)

				return {
					content: [
						{
							type: 'text' as const,
							text: content,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error searching world: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
