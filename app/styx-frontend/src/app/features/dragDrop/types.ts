import useEventTracks from '../world/components/Timeline/components/TimelineTracks/hooks/useEventTracks'

export type AllowedDraggableType = 'timelineEvent'
export type DraggableParams = {
	['timelineEvent']: {
		event: ReturnType<typeof useEventTracks>[number]['events'][number]
	}
}
