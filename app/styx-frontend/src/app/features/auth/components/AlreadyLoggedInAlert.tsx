import Alert from '@mui/material/Alert'
import Collapse from '@mui/material/Collapse'
import { Link } from '@tanstack/react-router'
import { useSelector } from 'react-redux'
import { TransitionGroup } from 'react-transition-group'

import { getAuthState } from '../AuthSliceSelectors'

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
						It seems you&apos;ve already logged in. Click{' '}
						<Link from="/" to="/">
							here
						</Link>{' '}
						to continue to the app.
					</Alert>
				</Collapse>
			)}
		</TransitionGroup>
	)
}
