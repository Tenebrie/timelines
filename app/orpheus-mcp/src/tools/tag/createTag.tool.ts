import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { RheaService } from '@src/services/RheaService.js'
import { checkTagDoesNotExist } from '@src/utils/findByName.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'create_tag'

const inputSchema = z.object({
	name: z.string().describe('The name of the tag'),
	description: z.string().optional().describe('The description of the tag (optional)'),
})

export function registerCreateTagTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Create Tag',
			description:
				'Create a new tag in the current world with name and optional description. Tag name is human readable.',
			inputSchema,
		},
		async (args: z.infer<typeof inputSchema>, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, args)

				const worldId = ContextService.getCurrentWorldOrThrow(sessionId)
				const userId = ContextService.getCurrentUserIdOrThrow(sessionId)
				const { name, description } = args

				await checkTagDoesNotExist({ name, userId, sessionId })

				const tag = await RheaService.createTag({
					worldId,
					userId,
					name,
					description,
				})

				Logger.toolSuccess(TOOL_NAME, `Created tag: ${tag.name} (${tag.id})`)
				return {
					content: [
						{
							type: 'text' as const,
							text:
								`Tag created successfully!\n` +
								`Name: ${tag.name}\n` +
								`Description: ${tag.description || 'None'}`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error creating tag: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
