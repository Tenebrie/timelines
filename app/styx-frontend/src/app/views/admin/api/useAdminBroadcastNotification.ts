import { useAdminBroadcastNotificationMutation } from '@api/adminNotificationsApi'
import { useCallback } from 'react'

import { parseApiResponse } from '@/app/utils/parseApiResponse'

export function useAdminBroadcastNotification() {
	const [broadcastNotificationMutation, state] = useAdminBroadcastNotificationMutation()

	const broadcastNotification = useCallback(
		async ({ title, description, fullRun }: { title: string; description: string; fullRun: boolean }) => {
			const { response, error } = parseApiResponse(
				await broadcastNotificationMutation({
					body: {
						title,
						description,
						fullRun,
					},
				}),
			)
			if (error) {
				return { error }
			}
			return { response }
		},
		[broadcastNotificationMutation],
	)

	return [broadcastNotification, state] as const
}
