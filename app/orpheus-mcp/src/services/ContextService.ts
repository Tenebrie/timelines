import { RedisService } from './RedisService.js'

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

const sessionKey = (sessionId: string) => `orpheus:session:${sessionId}`
const userWorldKey = (userId: string) => `orpheus:user:${userId}:world`

interface SessionRecord {
	userId: string | null
}

class ContextServiceImpl {
	async createSession(sessionId: string, userId: string | null): Promise<void> {
		await this.writeSession(sessionId, { userId })
	}

	async sessionExists(sessionId: string): Promise<boolean> {
		return (await RedisService.get(sessionKey(sessionId))) !== null
	}

	async getCurrentUserId(sessionId: string): Promise<string | null> {
		const raw = await RedisService.get(sessionKey(sessionId))
		return raw ? (JSON.parse(raw) as SessionRecord).userId : null
	}

	async getCurrentUserIdOrThrow(sessionId: string): Promise<string> {
		const userId = await this.getCurrentUserId(sessionId)
		if (!userId) {
			throw new Error('No user set for this session')
		}
		return userId
	}

	async setCurrentUserId(sessionId: string, userId: string | null): Promise<void> {
		await this.writeSession(sessionId, { userId })
	}

	async getCurrentWorld(sessionId: string): Promise<string | null> {
		const userId = await this.getCurrentUserId(sessionId)
		if (!userId) {
			return null
		}
		return RedisService.get(userWorldKey(userId))
	}

	async getCurrentWorldOrThrow(sessionId: string): Promise<string> {
		const worldId = await this.getCurrentWorld(sessionId)
		if (!worldId) {
			throw new Error('No world set for this session')
		}
		return worldId
	}

	async setCurrentWorld(sessionId: string, worldId: string | null): Promise<void> {
		const userId = await this.getCurrentUserIdOrThrow(sessionId)
		if (worldId === null) {
			await RedisService.del(userWorldKey(userId))
			return
		}
		await RedisService.set(userWorldKey(userId), worldId)
	}

	async removeSession(sessionId: string): Promise<void> {
		await RedisService.del(sessionKey(sessionId))
	}

	private async writeSession(sessionId: string, record: SessionRecord): Promise<void> {
		await RedisService.set(sessionKey(sessionId), JSON.stringify(record), SESSION_TTL_SECONDS)
	}
}

export const ContextService = new ContextServiceImpl()
