import { Actor, MentionDetails } from '@api/types/worldTypes'
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useEntityColorResolver } from '@/app/utils/colors/useEntityColor'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

export const useMentionsToString = () => {
	const { actors: baseActors, events: baseEvents } = useSelector(
		getWorldState,
		(a, b) => a.actors === b.actors && a.events === b.events,
	)

	const getEntityColor = useEntityColorResolver()

	const mentionsToString = useCallback(
		(data: MentionDetails[], owningActor: Actor | null, maxActorsDisplayed: number) => {
			const mentions = data.map((m) => m.targetId)
			const actors = baseActors.filter((a) => a.id !== owningActor?.id).filter((a) => mentions.includes(a.id))
			const events = baseEvents.filter((e) => mentions.includes(e.id))

			const shownMentions = [...actors, ...events]

			if (shownMentions.length === 0) {
				return ''
			} else if (shownMentions.length <= maxActorsDisplayed) {
				return shownMentions.map((actor, index) => (
					<React.Fragment key={actor.id}>
						<span style={{ color: getEntityColor(actor) }}>{actor.name}</span>
						{index < shownMentions.length - 1 ? ' & ' : ''}
					</React.Fragment>
				))
			} else {
				return shownMentions.slice(0, maxActorsDisplayed - 1).map((actor, index) => (
					<React.Fragment key={actor.id}>
						<span style={{ color: getEntityColor(actor) }}>{actor.name}</span>
						{index < maxActorsDisplayed - 2
							? ' & '
							: ` & (and ${shownMentions.length - maxActorsDisplayed + 1} more...)`}
					</React.Fragment>
				))
			}
		},
		[baseActors, baseEvents, getEntityColor],
	)

	return mentionsToString
}
