import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import { ServerNotification, ServerRequest } from '@modelcontextprotocol/sdk/types.js'

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
