import { useWorldRouter } from '../../router'
import { ActorDetails, WorldStatement } from '../../types'
import { StyledListItemButton, ZebraWrapper } from '../Outliner/styles'
import { StatementVisualRenderer } from './StatementVisualRenderer'

type Props = {
	statement: WorldStatement
	active: boolean
	owningActor: ActorDetails | null
	index: number
	short?: boolean
}

export const StatementRenderer = ({ statement, active, owningActor, index, short }: Props) => {
	const { navigateToStatementEditor } = useWorldRouter()

	return (
		<ZebraWrapper zebra={index % 2 === 0}>
			<StyledListItemButton selected={false} onClick={() => navigateToStatementEditor(statement.id)}>
				<StatementVisualRenderer
					statement={statement}
					active={active}
					owningActor={owningActor}
					short={short}
				/>
			</StyledListItemButton>
		</ZebraWrapper>
	)
}
