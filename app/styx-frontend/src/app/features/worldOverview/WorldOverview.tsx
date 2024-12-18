import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Navigate } from 'react-router-dom'

import { useAuthCheck } from '../auth/authCheck/useAuthCheck'
import { OverviewPanel } from './OverviewPanel/OverviewPanel'

export const WorldOverview = () => {
	const { success, target } = useAuthCheck()

	if (!success) {
		return <Navigate to={target} />
	}

	return (
		<>
			<Stack
				sx={{
					width: '100%',
					height: '100%',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Paper
					sx={{
						padding: 2,
						paddingTop: 3,
						width: 'calc(100% - 64px)',
						height: 'calc(100% - 128px)',
						maxWidth: '1000px',
						maxHeight: 'calc(100% - 16px)',
						overflowY: 'auto',
					}}
					elevation={2}
				>
					<Stack gap={1}>
						<Stack gap={1}>
							<Stack width="100%" justifyContent="space-between" direction="row" alignContent="center">
								<Typography variant="h6" marginLeft={1}>
									World overview
								</Typography>
							</Stack>
							<Divider />
						</Stack>
						<Stack gap={1}>
							<OverviewPanel />
						</Stack>
					</Stack>
				</Paper>
			</Stack>
		</>
	)
}
