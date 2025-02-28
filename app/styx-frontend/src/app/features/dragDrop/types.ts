import { MarkerType, TimelineEntity } from '@/api/types/types'

import { TimelineTrack } from '../../views/world/views/timeline/hooks/useEventTracks'
import { WikiArticle } from '../../views/world/views/wiki/types'

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
