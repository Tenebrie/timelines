import { Logger } from '@src/utils/logger.js'
import { randomUUID } from 'crypto'
import { createClient, RedisClientType } from 'redis'

/**
 * Distributed leader election service using Redis locks.
 * Ensures only ONE Calliope instance persists each Yjs document to Rhea.
 */
export class PersistenceLeaderService {
	private redisClient: RedisClientType
	private readonly LOCK_TTL = 60 // seconds
	private readonly instanceId: string

	constructor() {
		// Generate a stable, unique instance ID for this Calliope instance
		// Prefer HOSTNAME (set by Docker/K8s), otherwise generate a UUID
		this.instanceId = process.env.HOSTNAME || `calliope-${randomUUID()}`
		console.info(`Generated instance ID: ${this.instanceId}`)

		this.redisClient = createClient({
			socket: {
				host: 'redis',
			},
		})
		this.redisClient.on('error', (err) => console.error('PersistenceLeaderService Redis Error:', err))
	}

	async connect() {
		if (!this.redisClient.isOpen) {
			await this.redisClient.connect()
		}
	}

	private getLockKey(docName: string): string {
		return `yjs:persistence:lock:${docName}`
	}

	/**
	 * Try to acquire leadership for persisting a document.
	 * Returns true if this instance becomes the leader.
	 * Lock expires after LOCK_TTL seconds if not renewed.
	 *
	 * Uses Lua script for atomic acquire-or-extend operation:
	 * - If key doesn't exist: set it (acquire)
	 * - If key exists and value matches: extend TTL (renew)
	 * - Otherwise: fail (someone else has it)
	 */
	async tryAcquireLeadership(docName: string): Promise<boolean> {
		await this.connect()

		const lockKey = this.getLockKey(docName)

		// Lua script for atomic acquire-or-extend
		// Returns 1 if we acquired/renewed, 0 if someone else has it
		const script = `
			local key = KEYS[1]
			local value = ARGV[1]
			local ttl = tonumber(ARGV[2])
			
			local current = redis.call('GET', key)
			
			-- Key doesn't exist, acquire it
			if current == false then
				redis.call('SET', key, value, 'EX', ttl)
				return 1
			end
			
			-- We already own it, extend TTL
			if current == value then
				redis.call('EXPIRE', key, ttl)
				return 1
			end
			
			-- Someone else owns it
			return 0
		`

		const result = await this.redisClient.eval(script, {
			keys: [lockKey],
			arguments: [this.instanceId, this.LOCK_TTL.toString()],
		})

		const success = result === 1

		if (success) {
			Logger.yjsInfo(docName, `Acquired/renewed leadership`)
		}

		return success
	}

	/**
	 * Check if this instance is the leader for a document.
	 */
	async isLeader(docName: string): Promise<boolean> {
		await this.connect()

		const lockKey = this.getLockKey(docName)
		const currentOwner = await this.redisClient.get(lockKey)

		return currentOwner === this.instanceId
	}

	/**
	 * Release leadership for a document.
	 * Uses Lua script for atomic delete-if-owner to prevent race conditions.
	 */
	async release(docName: string) {
		await this.connect()

		const lockKey = this.getLockKey(docName)

		// Lua script for atomic delete-if-owner
		// Only deletes if we still own the lock
		const script = `
			local key = KEYS[1]
			local value = ARGV[1]
			
			if redis.call('GET', key) == value then
				return redis.call('DEL', key)
			end
			return 0
		`

		const result = await this.redisClient.eval(script, {
			keys: [lockKey],
			arguments: [this.instanceId],
		})

		if (result === 1) {
			Logger.yjsInfo(docName, `Released leadership`)
		} else {
			Logger.yjsInfo(docName, `Not the leader, skipping`)
		}
	}

	/**
	 * Cleanup on shutdown (no-op now since locks auto-expire).
	 */
	async shutdown() {
		if (this.redisClient.isOpen) {
			await this.redisClient.quit()
		}
	}
}

export const persistenceLeaderService = new PersistenceLeaderService()
