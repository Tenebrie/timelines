/**
 * Session-specific context for MCP connections.
 * Each MCP session gets its own context instance.
 */
export interface SessionContext {
	currentUserId: string | null
	currentWorldId: string | null
}

/**
 * Manages per-session context for MCP tool invocations.
 * The MCP SDK provides sessionId in the extra parameter of tool handlers.
 */
class ContextServiceImpl {
	private sessions = new Map<string, SessionContext>()

	/**
	 * Get or create a session context
	 */
	getSession(sessionId: string): SessionContext {
		let session = this.sessions.get(sessionId)
		if (!session) {
			session = {
				currentUserId: null,
				currentWorldId: null,
			}
			this.sessions.set(sessionId, session)
		}
		return session
	}

	/**
	 * Set the current world for a session
	 */
	setCurrentWorld(sessionId: string, worldId: string | null): void {
		const session = this.getSession(sessionId)
		session.currentWorldId = worldId
	}

	/**
	 * Get the current world for a session
	 */
	getCurrentWorld(sessionId: string): string | null {
		return this.getSession(sessionId).currentWorldId
	}

	getCurrentWorldOrThrow(sessionId: string): string {
		const worldId = this.getCurrentWorld(sessionId)
		if (!worldId) {
			throw new Error('No world set for this session')
		}
		return worldId
	}

	/**
	 * Get the current user ID for a session
	 */
	getCurrentUserId(sessionId: string): string | null {
		return this.getSession(sessionId).currentUserId
	}

	getCurrentUserIdOrThrow(sessionId: string): string {
		const userId = this.getCurrentUserId(sessionId)
		if (!userId) {
			throw new Error('No user set for this session')
		}
		return userId
	}

	/**
	 * Set the current user ID for a session
	 */
	setCurrentUserId(sessionId: string, userId: string | null): void {
		const session = this.getSession(sessionId)
		session.currentUserId = userId
	}

	/**
	 * Clean up a session when it closes
	 */
	removeSession(sessionId: string): void {
		this.sessions.delete(sessionId)
	}

	/**
	 * Get the number of active sessions (for debugging)
	 */
	getSessionCount(): number {
		return this.sessions.size
	}
}

export const ContextService = new ContextServiceImpl()
