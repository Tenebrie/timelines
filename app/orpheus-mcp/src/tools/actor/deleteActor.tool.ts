import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'delete_actor'

const inputSchema = z.object({
	actorName: z.string().describe('The name of the actor to delete'),
})

export function registerDeleteActorTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			description: 'Delete an actor by name from the current world',
			inputSchema,
		},
		async (args: z.infer<typeof inputSchema>, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, args)

				const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = ContextService.getCurrentUserIdOrThrow(sessionId)
				const { actorName } = args

				const worldData = await RheaService.getWorldDetails({ worldId, userId })
				const actor = worldData.actors.find((a) => a.name.toLowerCase() === actorName.toLowerCase())

				if (!actor) {
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

				await RheaService.deleteActor({
					worldId,
					actorId: actor.id,
					userId,
				})

				Logger.toolSuccess(TOOL_NAME, `Deleted actor: ${actor.name}`)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Actor "${actor.name}" (ID: ${actor.id}) has been deleted successfully.`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error deleting actor: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
