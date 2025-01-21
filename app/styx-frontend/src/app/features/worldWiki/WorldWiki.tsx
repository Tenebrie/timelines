import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Navigate, Outlet } from 'react-router-dom'

import { useAuthCheck } from '../auth/authCheck/useAuthCheck'
import { ArticleList } from './components/ArticleList/ArticleList'
import { ArticleTitle } from './components/ArticleTitle/ArticleTitle'

export const WorldWiki = () => {
	const { success, target } = useAuthCheck()

	if (!success) {
		return <Navigate to={target} />
	}

	return (
		<>
			<Stack
				sx={{
					width: 'calc(100% - 32px)',
					height: '100%',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'row',
					margin: '0 16px',
					gap: 2,
				}}
			>
				<Paper
					sx={{
						padding: 2,
						paddingTop: 3,
						width: 'calc(100% - 64px)',
						height: 'calc(100% - 128px)',
						maxWidth: '400px',
						maxHeight: 'calc(100% - 16px)',
						overflowY: 'auto',
					}}
					elevation={2}
				>
					<Stack gap={1}>
						<Stack gap={1}>
							<Stack width="100%" justifyContent="space-between" direction="row" alignContent="center">
								<Typography variant="h6" marginLeft={1}>
									Articles
								</Typography>
							</Stack>
							<Divider />
						</Stack>
						<ArticleList />
					</Stack>
				</Paper>
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
							<ArticleTitle />
							<Divider />
						</Stack>
						{<Outlet />}
					</Stack>
				</Paper>
			</Stack>
		</>
	)
}
