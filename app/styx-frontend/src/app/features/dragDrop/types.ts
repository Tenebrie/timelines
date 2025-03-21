import { MarkerType, TimelineEntity } from '@api/types/worldTypes'
import { WikiArticle } from '@api/types/worldWikiTypes'

import { TimelineTrack } from '../../views/world/views/timeline/hooks/useEventTracks'

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
