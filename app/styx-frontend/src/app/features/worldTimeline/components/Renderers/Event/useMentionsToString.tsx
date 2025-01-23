import React from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/features/world/selectors'
import { Actor, MentionDetails } from '@/app/features/worldTimeline/types'

export const useMentionsToString = () => {
	const { actors: baseActors } = useSelector(getWorldState, (a, b) => a.actors === b.actors)

	const mentionsToString = (
		data: MentionDetails[],
		owningActor: Actor | null,
		maxActorsDisplayed: number,
	) => {
		const mentions = data.map((m) => m.targetId)
		const actors = baseActors.filter((a) => a.id !== owningActor?.id).filter((a) => mentions.includes(a.id))

		const actorToColor = (actor: Actor) => {
			if (actor.color) {
				return actor.color
			}
			return ''
		}

		if (actors.length === 0) {
			return ''
		} else if (actors.length <= maxActorsDisplayed) {
			return actors.map((actor, index) => (
				<React.Fragment key={actor.id}>
					<span style={{ color: actorToColor(actor) }}>{actor.name}</span>
					{index < actors.length - 1 ? ' & ' : ''}
				</React.Fragment>
			))
		} else {
			return actors.slice(0, maxActorsDisplayed - 1).map((actor, index) => (
				<React.Fragment key={actor.id}>
					<span style={{ color: actorToColor(actor) }}>{actor.name}</span>
					{index < maxActorsDisplayed - 2
						? ' & '
						: ` & (and ${actors.length - maxActorsDisplayed + 1} more...)`}
				</React.Fragment>
			))
		}
	}

	return mentionsToString
}
