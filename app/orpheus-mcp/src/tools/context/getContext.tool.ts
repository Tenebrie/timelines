import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import { ServerNotification, ServerRequest } from '@modelcontextprotocol/sdk/types.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { Logger } from '@src/utils/Logger.js'

const TOOL_NAME = 'get_context'

export function registerGetContextTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			description: 'Get the current session context, including the currently selected world (if any).',
		},
		async (extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
			const sessionId = extra.sessionId ?? 'default'
			Logger.toolInvocation(TOOL_NAME, { sessionId })

			try {
				const userId = ContextService.getCurrentUserId(sessionId)
				if (!userId) {
					Logger.toolSuccess(TOOL_NAME, 'No user currently selected')
					return {
						content: [
							{
								type: 'text' as const,
								text: 'No user currently selected.\n' + 'Use set_context to set the current user ID.',
							},
						],
					}
				}

				const currentWorldId = ContextService.getCurrentWorld(sessionId)

				if (!currentWorldId) {
					Logger.toolSuccess(TOOL_NAME, 'No world currently selected')
					return {
						content: [
							{
								type: 'text' as const,
								text:
									'No world is currently selected.\n' +
									'Use list_worlds to see available worlds, then set_context to select one.',
							},
						],
					}
				}

				// Get world details
				const worldData = await RheaService.getWorldDetails({ worldId: currentWorldId, userId })

				Logger.toolSuccess(TOOL_NAME, `Current world: ${worldData.name}`)
				return {
					content: [
						{
							type: 'text' as const,
							text:
								`Current context:\n` +
								`World: "${worldData.name}" (ID: ${currentWorldId})\n` +
								`Access: ${worldData.isReadOnly ? 'Read-Only' : 'Read-Write'}\n` +
								`Events: ${worldData.events.length}\n` +
								`Actors: ${worldData.actors.length}`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				// If we can't fetch the world, it might have been deleted - clear context
				ContextService.setCurrentWorld(sessionId, null)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error fetching current context: ${error instanceof Error ? error.message : JSON.stringify(error)}. Context has been cleared.`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
