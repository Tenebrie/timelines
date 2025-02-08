import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Outlet, useMatch } from '@tanstack/react-router'

import { ArticleList } from './components/ArticleList/ArticleList'
import { ArticleListHeader } from './components/ArticleListHeader/ArticleListHeader'
import { ArticleTitle } from './components/ArticleTitle/ArticleTitle'

export const WorldWiki = () => {
	const isArticle = !!useMatch({ from: '/world/$worldId/_world/wiki/_wiki/$articleId', shouldThrow: false })

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
					{isArticle && (
						<Stack gap={1} height={'calc(100%)'}>
							<Stack gap={1}>
								<ArticleTitle />
								<Divider />
							</Stack>
							<Box height={'calc(100% - 64px)'}>{<Outlet />}</Box>
						</Stack>
					)}
				</Paper>
			</Stack>
		</>
	)
}
