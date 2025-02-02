import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Navigate, Outlet } from 'react-router-dom'

import { useAuthCheck } from '../auth/authCheck/useAuthCheck'
import { ArticleList } from './components/ArticleList/ArticleList'
import { ArticleListHeader } from './components/ArticleListHeader/ArticleListHeader'
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
						maxWidth: '350px',
						maxHeight: 'calc(100% - 16px)',
						overflowY: 'auto',
					}}
					elevation={2}
					data-testid="ArticleListWithHeader"
				>
					<Stack gap={1}>
						<Stack gap={1}>
							<ArticleListHeader />
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
					<Stack gap={1} height={'calc(100%)'}>
						<Stack gap={1}>
							<ArticleTitle />
							<Divider />
						</Stack>
						<Box height={'calc(100% - 64px)'}>{<Outlet />}</Box>
					</Stack>
				</Paper>
			</Stack>
		</>
	)
}
