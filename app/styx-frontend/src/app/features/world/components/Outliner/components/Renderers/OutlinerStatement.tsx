import { ArrowRightAlt, Link } from '@mui/icons-material'
import ListItemText from '@mui/material/ListItemText'
import React from 'react'

import { TrunkatedTypography } from '../../../../../../components/TrunkatedTypography'
import { useWorldRouter } from '../../../../router'
import { Actor, ActorDetails, WorldStatement } from '../../../../types'
import { StatementActorsText, StatementColoredActor, StyledListItemButton, ZebraWrapper } from '../../styles'

type Props = {
	statement: WorldStatement & { active: boolean }
	owningActor: ActorDetails | null
	index: number
}

export const StatementColorActor = (props: { children: React.ReactNode; color: string }) => {
	return <span style={{ color: props.color }}>{props.children}</span>
}

export const OutlinerStatement = ({ statement, owningActor, index }: Props) => {
	const { navigateToStatementEditor } = useWorldRouter()

	const maxActorsDisplayed = 4
	const actorsToString = (data: Actor[]) => {
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
			return (
				actors
					.slice(0, maxActorsDisplayed - 1)
					.map((actor) => <StatementColoredActor>{actor.name}</StatementColoredActor>)
					.join(' | ') + ` | (and ${actors.length - maxActorsDisplayed + 1} more...)`
			)
		}
	}

	const targetActors = actorsToString(statement.targetActors)
	const mentionedActors = actorsToString(statement.mentionedActors)

	const content = (
		<>
			{statement.title.length > 0 && <b>{statement.title}:</b>} {statement.content}
		</>
	)
	return (
		<ZebraWrapper zebra={index % 2 === 0}>
			<StyledListItemButton
				selected={false}
				sx={{ pl: 4 }}
				onClick={() => navigateToStatementEditor(statement.id)}
			>
				<ListItemText
					data-hj-suppress
					primary={<TrunkatedTypography lines={3}>{content}</TrunkatedTypography>}
					secondary={
						<TrunkatedTypography lines={3} component="span">
							<StatementActorsText>
								{targetActors.length > 0 ? <Link /> : ''} {targetActors}
								{mentionedActors.length > 0 ? <ArrowRightAlt /> : ''} {mentionedActors}
							</StatementActorsText>
						</TrunkatedTypography>
					}
					style={{ color: statement.active ? 'inherit' : 'gray' }}
				></ListItemText>
			</StyledListItemButton>
		</ZebraWrapper>
	)
}
