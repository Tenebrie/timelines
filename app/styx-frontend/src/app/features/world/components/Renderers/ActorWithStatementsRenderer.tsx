import { Collapse, Divider, List } from '@mui/material'
import { TransitionGroup } from 'react-transition-group'

import { ActorDetails, WorldStatement } from '../../types'
import { ActorRenderer } from './ActorRenderer'
import { EmptyStatementListRenderer } from './EmptyStatementListRenderer'
import { StatementRenderer } from './StatementRenderer'

type Props = {
	actor: ActorDetails & {
		statements: (WorldStatement & { active: boolean })[]
	}
	highlighted: boolean
	collapsed: boolean
	divider: boolean
}

export const ActorWithStatementsRenderer = ({ actor, highlighted, collapsed, divider }: Props) => {
	return (
		<>
			<ActorRenderer actor={actor} collapsed={collapsed} highlighted={highlighted} />
			<List dense component="div" disablePadding>
				<TransitionGroup>
					{!collapsed &&
						actor.statements.map((statement: Props['actor']['statements'][number], index) => (
							<Collapse key={statement.id}>
								<StatementRenderer
									statement={statement}
									active={statement.active}
									owningActor={actor}
									index={index}
								/>
							</Collapse>
						))}
					{!collapsed && actor.statements.length === 0 && (
						<Collapse>
							<EmptyStatementListRenderer />
						</Collapse>
					)}
				</TransitionGroup>
			</List>
			{divider && <Divider />}
		</>
	)
}
