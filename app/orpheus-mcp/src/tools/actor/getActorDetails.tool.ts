import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'get_actor_details'

const inputSchema = z.object({
	actorName: z.string().describe('The name of the actor to find'),
})

export function registerGetActorDetailsTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			description: 'Get details about a specific actor by name, including name, title, and description',
			inputSchema,
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

				const actor = worldData.actors.find((a) => a.name.toLowerCase() === actorName.toLowerCase())

				if (!actor) {
					Logger.toolError(TOOL_NAME, `Actor "${actorName}" not found`)
					return {
						content: [
							{
								type: 'text' as const,
								text: `Actor "${actorName}" not found in this world. Available actors: ${worldData.actors.map((a) => a.name).join(', ') || 'None'}`,
							},
						],
						isError: true,
					}
				}

				const content = await RheaService.getActorContent({
					worldId,
					actorId: actor.id,
					userId,
				})

				Logger.toolSuccess(TOOL_NAME, `Found actor: ${actor.name}`)
				return {
					content: [
						{
							type: 'text' as const,
							text:
								`Actor: ${actor.name}\n` +
								`ID: ${actor.id}\n` +
								`Title: ${actor.title || 'None'}\n` +
								`Description: ${content.contentHtml || 'No description'}`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error fetching actor: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
