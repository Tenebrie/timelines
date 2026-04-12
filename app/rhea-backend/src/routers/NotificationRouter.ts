import { AdminAuthenticator } from '@src/middleware/auth/AdminAuthenticator.js'
import { AnnouncementService } from '@src/services/AnnouncementService.js'
import { AuditLogService } from '@src/services/AuditLogService.js'
import {
	BooleanValidator,
	NonEmptyStringValidator,
	OptionalParam,
	Router,
	useApiEndpoint,
	useAuth,
	useRequestBody,
} from 'moonflower'

import { adminNotificationsTag } from './utils/tags.js'

const router = new Router().with(async (ctx) => {
	const user = await useAuth(ctx, AdminAuthenticator)
	return {
		user,
	}
})

router.post('/api/admin/notifications/broadcast', async (ctx) => {
	useApiEndpoint({
		name: 'adminBroadcastNotification',
		description:
			'Broadcasts a notification to all users. Defaults to test mode (admin-only) if fullRun is not provided.',
		tags: [adminNotificationsTag],
	})

	const { title, description, fullRun } = useRequestBody(ctx, {
		title: NonEmptyStringValidator,
		description: NonEmptyStringValidator,
		fullRun: OptionalParam(BooleanValidator),
	})

	const isFullRun = fullRun === true

	const { recipientCount } = await AnnouncementService.broadcastNotification({
		title,
		description,
		testRun: !isFullRun,
	})

	const mode = isFullRun ? 'fullRun' : 'testRun'

	AuditLogService.append(ctx, {
		action: 'AdminBroadcastNotification',
		data: {
			title,
			description,
			mode,
			recipientCount,
		},
	})

	return {
		recipientCount,
		mode,
	}
})

export const NotificationRouter = router
