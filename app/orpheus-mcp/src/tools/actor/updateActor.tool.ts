import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { findByName } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'update_actor'

const inputSchema = z.object({
	actorName: z.string().describe('The name of the actor to update'),
	name: z.string().optional().describe('The new name for the actor (optional)'),
	title: z.string().optional().describe('The new title for the actor (optional)'),
	description: z.string().optional().describe('The new description in HTML format (optional)'),
})

export function registerUpdateActorTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Update Actor',
			description: 'Update an existing actor by name. Find the actor by name and update its properties.',
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
				const { actorName, name, title, description } = args

				const worldData = await RheaService.getWorldDetails({ worldId, userId })
				const actor = findByName({ name: actorName, entities: worldData.actors })

				const updatedActor = await RheaService.updateActor({
					worldId,
					actorId: actor.id,
					userId,
					name,
					title,
				})

				if (description !== undefined) {
					await RheaService.updateActorContent({
						worldId,
						actorId: actor.id,
						userId,
						content: description,
					})
				}

				Logger.toolSuccess(TOOL_NAME, `Updated actor: ${updatedActor.name}`)
				return {
					content: [
						{
							type: 'text' as const,
							text:
								`Actor updated successfully!\n` +
								`Name: ${updatedActor.name}\n` +
								`ID: ${updatedActor.id}\n` +
								`Title: ${updatedActor.title || 'None'}`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error updating actor: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
