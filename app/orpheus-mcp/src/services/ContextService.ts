/**
 * Session-specific context for MCP connections.
 * Each MCP session gets its own context instance.
 * Note: worldId is stored per-user, not per-session, to persist across sessions.
 */
export interface SessionContext {
	currentUserId: string | null
}

/**
 * User-specific context that persists across sessions.
 */
export interface UserContext {
	currentWorldId: string | null
}

/**
 * Manages per-session and per-user context for MCP tool invocations.
 * Session context (userId) is ephemeral and tied to the session lifecycle.
 * User context (worldId) persists across sessions for the same user.
 */
class ContextServiceImpl {
	private sessions = new Map<string, SessionContext>()
	private users = new Map<string, UserContext>()

	/**
	 * Get or create a session context
	 */
	getSession(sessionId: string): SessionContext {
		let session = this.sessions.get(sessionId)
		if (!session) {
			session = {
				currentUserId: null,
			}
			this.sessions.set(sessionId, session)
		}
		return session
	}

	/**
	 * Get or create a user context
	 */
	private getUserContext(userId: string): UserContext {
		let userContext = this.users.get(userId)
		if (!userContext) {
			userContext = {
				currentWorldId: null,
			}
			this.users.set(userId, userContext)
		}
		return userContext
	}

	/**
	 * Set the current world for a user (persists across sessions)
	 */
	setCurrentWorld(sessionId: string, worldId: string | null): void {
		const userId = this.getCurrentUserIdOrThrow(sessionId)
		const userContext = this.getUserContext(userId)
		userContext.currentWorldId = worldId
	}

	/**
	 * Get the current world for a user (persists across sessions)
	 */
	getCurrentWorld(sessionId: string): string | null {
		const userId = this.getCurrentUserId(sessionId)
		if (!userId) {
			return null
		}
		return this.getUserContext(userId).currentWorldId
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
	 * Clean up a session when it closes.
	 * Note: User context is NOT cleaned up to persist across sessions.
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

	/**
	 * Get the number of users with stored context (for debugging)
	 */
	getUserCount(): number {
		return this.users.size
	}
}

export const ContextService = new ContextServiceImpl()
