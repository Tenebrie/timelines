import React from 'react'

import { Actor } from '../../../types'

export const useActorsToString = () => {
	const actorsToString = (data: Actor[], owningActor: Actor | null, maxActorsDisplayed: number) => {
		const actors = data.filter((a) => a.id !== owningActor?.id)

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

	return actorsToString
}
