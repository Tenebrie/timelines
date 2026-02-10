import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'create_actor'

const inputSchema = z.object({
	name: z.string().describe('The name of the actor'),
	title: z.string().optional().describe('The title of the actor (optional)'),
	description: z.string().optional().describe('The description of the actor in HTML format (optional)'),
})

export function registerCreateActorTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			description: 'Create a new actor in the current world with name, title, and description',
			inputSchema,
		},
		async (args: z.infer<typeof inputSchema>, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, args)

				const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = ContextService.getCurrentUserIdOrThrow(sessionId)
				const { name, title, description } = args

				const actor = await RheaService.createActor({
					worldId,
					userId,
					name,
					title,
					descriptionRich: description,
				})

				Logger.toolSuccess(TOOL_NAME, `Created actor: ${actor.name} (${actor.id})`)
				return {
					content: [
						{
							type: 'text' as const,
							text:
								`Actor created successfully!\n` +
								`Name: ${actor.name}\n` +
								`ID: ${actor.id}\n` +
								`Title: ${actor.title || 'None'}`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error creating actor: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
