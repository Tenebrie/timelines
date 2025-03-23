import Queue from 'bull'

import { RedisService } from './RedisService'
import { UserService } from './UserService'

export class SchedulerService {
	private static instance: SchedulerService
	private cleanupQueue: Queue.Queue

	private constructor() {
		this.cleanupQueue = new Queue('user-cleanup', {
			redis: RedisService.getRedisConfig(),
			defaultJobOptions: {
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 1000,
				},
			},
		})

		// Process the cleanup job
		this.cleanupQueue.process(async () => {
			try {
				await UserService.cleanUpDeletedUsers()
			} catch (error) {
				console.error('Failed to clean up deleted users:', error)
				throw error
			}
		})

		// Schedule the cleanup job to run every hour
		this.cleanupQueue.add({}, { repeat: { cron: '0 * * * *' } })
	}

	public static getInstance(): SchedulerService {
		if (!SchedulerService.instance) {
			SchedulerService.instance = new SchedulerService()
		}
		return SchedulerService.instance
	}

	public async shutdown(): Promise<void> {
		await this.cleanupQueue.close()
	}
}
