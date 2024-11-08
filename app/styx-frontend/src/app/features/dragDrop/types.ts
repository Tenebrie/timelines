import { TimelineTrack } from '../world/components/Timeline/components/TimelineTracks/hooks/useEventTracks'
import { MarkerType, TimelineEntity } from '../world/types'

export type AllowedDraggableType = 'timelineEvent' | 'timelineTrack'
export type DraggableParams = {
	['timelineEvent']: {
		event: TimelineEntity<MarkerType>
	}
	['timelineTrack']: {
		track: TimelineTrack
	}
}
