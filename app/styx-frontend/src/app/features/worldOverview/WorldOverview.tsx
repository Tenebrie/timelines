import { Stack } from '@mui/material'
import { Navigate } from 'react-router-dom'

import { useAuthCheck } from '../auth/authCheck/useAuthCheck'
import { OverviewPanel } from '../worldTimeline/components/OverviewPanel/OverviewPanel'

export const WorldOverview = () => {
	const { success, target } = useAuthCheck()

	if (!success) {
		return <Navigate to={target} />
	}

	return (
		<>
			<Stack sx={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
				<OverviewPanel />
			</Stack>
		</>
	)
}
