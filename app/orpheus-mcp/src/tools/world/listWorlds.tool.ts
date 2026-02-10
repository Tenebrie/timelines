import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { ContextService } from '@src/services/ContextService.js'
import { OAuthService } from '@src/services/OAuthService.js'
import { RheaService } from '@src/services/RheaService.js'
import { Logger } from '@src/utils/Logger.js'
import { getSessionId, ToolExtra } from '@src/utils/toolHelpers.js'
import z from 'zod'

const TOOL_NAME = 'list_worlds'

const inputSchema = z.object({
	userId: z.string().describe('The ID of the user to list worlds for. Local dev only.').optional(),
})

export function registerListWorldsTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'List Worlds',
			description: 'List all worlds (projects) the current user has access to.',
			inputSchema,
			annotations: {
				readOnlyHint: true,
				idempotentHint: true,
			},
		},
		async (args, extra: ToolExtra) => {
			try {
				const sessionId = getSessionId(extra)
				Logger.toolInvocation(TOOL_NAME, { ...args, sessionId })

				if (args.userId && OAuthService.loginEnforced()) {
					throw new Error('OAuth login required')
				}

				const userId = (() => {
					if (args.userId) {
						return args.userId
					}
					return ContextService.getCurrentUserIdOrThrow(sessionId)
				})()
				const data = await RheaService.listWorlds(userId)
				ContextService.setCurrentUserId(sessionId, userId)

				const worlds = [...data.ownedWorlds, ...data.contributableWorlds, ...data.visibleWorlds].map((w) => ({
					id: w.id,
					name: w.name,
					accessMode: w.accessMode,
				}))

				const worldList = worlds.map((w) => `"${w.name}" (ID: ${w.id}, Access: ${w.accessMode})`).join('\n')
				Logger.toolSuccess(TOOL_NAME, `Found ${worlds.length} worlds`)

				if (worlds.length === 1) {
					ContextService.setCurrentWorld(sessionId, worlds[0].id)
					return {
						content: [
							{
								type: 'text' as const,
								text: `Your worlds:\n${worldList || 'No worlds found'}`,
							},
							{
								type: 'text' as const,
								text: `As there is only one world, it has been automatically set as current context.`,
							},
						],
					}
				}

				return {
					content: [
						{
							type: 'text' as const,
							text: `Your worlds:\n${worldList || 'No worlds found'}`,
						},
						{
							type: 'text' as const,
							text: `Use set_context to set the working project (world).`,
						},
					],
				}
			} catch (error) {
				Logger.toolError(TOOL_NAME, error)
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error fetching worlds: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
						},
					],
					isError: true,
				}
			}
		},
	)
}
