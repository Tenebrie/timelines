import type { useWorldTimelineRouter } from '@/router/routes/worldTimelineRoutes'
import { ClientToCalliopeMessage } from '@/ts-shared/ClientToCalliopeMessage'

export type AllowedEvents =
	| 'scrollTimelineLeft'
	| 'scrollTimelineRight'
	| 'sendCalliopeMessage'
	| 'calliopeReconnected'
	| 'timelineScrolled'
	| 'richEditor/openMentions'
	| 'richEditor/updateMentions'
	| 'richEditor/closeMentions'
	| 'richEditor/keyDown'
	| 'navigate/worldTimeline'

export type EventParams = {
	['scrollTimelineLeft']: void
	['scrollTimelineRight']: void
	['sendCalliopeMessage']: ClientToCalliopeMessage
	['calliopeReconnected']: void
	['timelineScrolled']: void
	['richEditor/openMentions']: { query: string; screenPosTop: number; screenPosLeft: number }
	['richEditor/updateMentions']: { query: string }
	['richEditor/closeMentions']: void
	['richEditor/keyDown']: {
		key: string
		ctrlKey: boolean
		shiftKey: boolean
		altKey: boolean
		metaKey: boolean
	}
	['navigate/worldTimeline']: Parameters<ReturnType<typeof useWorldTimelineRouter>['navigateTo']>[0]
}
