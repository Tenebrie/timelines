import { TimelineTrack } from '../worldTimeline/components/Timeline/components/TimelineTracks/hooks/useEventTracks'
import { MarkerType, TimelineEntity } from '../worldTimeline/types'

export type AllowedDraggableType = 'timelineEvent' | 'timelineTrack'
export type DraggableParams = {
	['timelineEvent']: {
		event: TimelineEntity<MarkerType>
	}
	['timelineTrack']: {
		track: TimelineTrack
	}
}
