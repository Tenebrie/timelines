import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Outlet } from '@tanstack/react-router'

import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'

import { ArticleDetailsTitle } from './article/details/ArticleDetailsTitle'
import { ArticleList } from './article/list/ArticleList'
import { ArticleListHeader } from './article/list/ArticleListHeader'

export const Wiki = () => {
	const isArticle = useCheckRouteMatch('/world/$worldId/wiki/$articleId')

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
				}}
			>
				<Paper
					sx={{
						padding: 2,
						paddingTop: 3,
						width: 'calc(100% - 64px)',
						height: 'calc(100% - 64px)',
						maxWidth: '1350px',
						maxHeight: 'calc(100% - 16px)',
						display: 'flex',
						flexDirection: 'row',
						gap: 2,
					}}
					elevation={2}
				>
					<Stack
						sx={{
							width: '350px',
							minWidth: '350px',
						}}
						data-testid="ArticleListWithHeader"
					>
						<Stack gap={1} height={1}>
							<Stack gap={1}>
								<ArticleListHeader />
								<Divider />
							</Stack>
							<ArticleList parentId={null} depth={0} />
						</Stack>
					</Stack>
					<Stack
						sx={{
							flex: 1,
							height: '100%',
							overflowY: 'auto',
						}}
					>
						{isArticle && (
							<Stack gap={1} height={'calc(100%)'}>
								<Stack gap={1}>
									<ArticleDetailsTitle />
								</Stack>
								<Box height={'calc(100% - 44px)'}>{<Outlet />}</Box>
							</Stack>
						)}
					</Stack>
				</Paper>
			</Stack>
		</>
	)
}
