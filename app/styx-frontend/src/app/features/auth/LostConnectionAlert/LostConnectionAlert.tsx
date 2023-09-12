import { Alert, Snackbar } from '@mui/material'
import { useSelector } from 'react-redux'

import { getAuthState } from '../selectors'

type Props = {
	server: 'rhea' | 'calliope'
}

export const LostConnectionAlert = ({ server }: Props) => {
	const { showRheaConnectionAlert } = useSelector(getAuthState)
	const { showCalliopeConnectionAlert } = useSelector(getAuthState)

	const open =
		(server === 'rhea' && showRheaConnectionAlert) || (server === 'calliope' && showCalliopeConnectionAlert)

	return (
		<Snackbar open={open}>
			<Alert severity="warning" sx={{ width: '100%' }}>
				Unable to reach the server
			</Alert>
		</Snackbar>
	)
}
