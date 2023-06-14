import { Collapse, Divider, List } from '@mui/material'
import { TransitionGroup } from 'react-transition-group'

import { WorldEvent, WorldStatement } from '../../types'
import { EmptyStatementListRenderer } from './EmptyStatementListRenderer'
import { EventRenderer } from './EventRenderer'
import { StatementRenderer } from './StatementRenderer'

type Props = {
	event: WorldEvent & {
		issuedStatements: (WorldStatement & { active: boolean })[]
	}
	secondary: string
	highlighted: boolean
	collapsed: boolean
	divider: boolean
}

export const EventWithStatementsRenderer = ({ event, secondary, highlighted, collapsed, divider }: Props) => {
	return (
		<>
			<EventRenderer event={event} secondary={secondary} highlighted={highlighted} collapsed={collapsed} />
			<List dense component="div" disablePadding>
				<TransitionGroup>
					{!collapsed &&
						event.issuedStatements.map((statement: Props['event']['issuedStatements'][number], index) => (
							<Collapse key={statement.id}>
								<StatementRenderer
									statement={statement}
									active={statement.active}
									owningActor={null}
									index={index}
								/>
							</Collapse>
						))}

					{!collapsed && event.issuedStatements.length === 0 && (
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
