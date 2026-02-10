import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import { ServerNotification, ServerRequest } from '@modelcontextprotocol/sdk/types.js'
import { ContextService } from '@src/services/ContextService.js'

/**
 * Type alias for the extra parameter passed to MCP tool handlers
 */
export type ToolExtra = RequestHandlerExtra<ServerRequest, ServerNotification>

/**
 * Extract sessionId from the extra parameter, with a fallback for testing
 */
export function getSessionId(extra: ToolExtra): string {
	return extra.sessionId ?? 'default'
}

export function validateWorldContext(extra: ToolExtra): boolean {
	const sessionId = getSessionId(extra)

	const worldId = ContextService.getCurrentWorld(sessionId)

	if (!worldId) {
		throw new Error('No world specified and no context set. Please provide use set_context first.')
	}

	return !!sessionId
}
