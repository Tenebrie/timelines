import { TimelineTrack } from '../worldTimeline/components/Timeline/components/TimelineTracks/hooks/useEventTracks'
import { MarkerType, TimelineEntity } from '../worldTimeline/types'
import { WikiArticle } from '../worldWiki/types'

export type DraggableParams = {
	['timelineEvent']: {
		event: TimelineEntity<MarkerType>
	}
	['timelineTrack']: {
		track: TimelineTrack
	}
	['articleListItem']: {
		article: WikiArticle
	}
}

export type AllowedDraggableType = keyof DraggableParams
