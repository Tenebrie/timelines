import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import Link from '@mui/material/Link'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { TransitionGroup } from 'react-transition-group'

import { getAuthState } from '../selectors'

type Props = {
	parentSpacing: number
}

export const AlreadyLoggedInAlert = ({ parentSpacing }: Props) => {
	const { user } = useSelector(getAuthState)

	return (
		<TransitionGroup style={{ marginBottom: -parentSpacing * 8 }}>
			{!!user && (
				<Collapse>
					<Alert severity="success" style={{ marginBottom: parentSpacing * 8 }}>
						It seems you've already logged in. Click{' '}
						<Link component={NavLink} to="/home">
							here
						</Link>{' '}
						to continue to the app.
					</Alert>
				</Collapse>
			)}
		</TransitionGroup>
	)
}
