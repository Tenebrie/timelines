import { ArrowRightAlt, Link } from '@mui/icons-material'
import ListItemText from '@mui/material/ListItemText'
import React from 'react'

import { TrunkatedTypography } from '../../../../components/TrunkatedTypography'
import { Actor, ActorDetails, WorldStatement } from '../../types'
import { StatementActorsText } from '../Outliner/styles'

type Props = {
	statement: WorldStatement
	active: boolean
	owningActor: ActorDetails | null
	short?: boolean
}

export const StatementColorActor = (props: { children: React.ReactNode; color: string }) => {
	return <span style={{ color: props.color }}>{props.children}</span>
}

const actorsToString = (data: Actor[], owningActor: ActorDetails | null, maxActorsDisplayed: number) => {
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
				<StatementColorActor color={actorToColor(actor)}>{actor.name}</StatementColorActor>
				{index < actors.length - 1 ? ' | ' : ''}
			</React.Fragment>
		))
	} else {
		return actors.slice(0, maxActorsDisplayed - 1).map((actor, index) => (
			<React.Fragment key={actor.id}>
				<StatementColorActor color={actorToColor(actor)}>{actor.name}</StatementColorActor>
				{index < maxActorsDisplayed - 2
					? ' | '
					: ` | (and ${actors.length - maxActorsDisplayed + 1} more...)`}
			</React.Fragment>
		))
	}
}

export const StatementVisualRenderer = ({ statement, active, owningActor, short }: Props) => {
	const maxActorsDisplayed = short ? 2 : 5
	const targetActors = actorsToString(statement.targetActors, owningActor, maxActorsDisplayed)
	const mentionedActors = actorsToString(statement.mentionedActors, owningActor, maxActorsDisplayed)

	const content = (
		<>
			{statement.title.length > 0 && <b>{statement.title}:</b>} {statement.content}
		</>
	)

	return (
		<ListItemText
			data-hj-suppress
			primary={
				<TrunkatedTypography lines={3} sx={{ fontSize: '16px' }}>
					{content}
				</TrunkatedTypography>
			}
			secondary={
				<TrunkatedTypography lines={3} sx={{ fontSize: '0.875rem' }} component="span">
					<StatementActorsText>
						{targetActors.length > 0 ? <Link /> : ''} {targetActors}
						{mentionedActors.length > 0 ? <ArrowRightAlt /> : ''} {mentionedActors}
					</StatementActorsText>
				</TrunkatedTypography>
			}
			style={{ color: active ? 'inherit' : 'gray' }}
		></ListItemText>
	)
}
