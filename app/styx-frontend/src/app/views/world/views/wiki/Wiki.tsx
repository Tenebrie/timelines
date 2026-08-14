import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { Outlet } from '@tanstack/react-router'

import { ActorDetails } from '@/app/features/entityEditor/actor/details/ActorDetails'
import { ArticleDetails } from '@/app/features/entityEditor/article/details/ArticleDetails'
import { EventDetails } from '@/app/features/entityEditor/event/details/EventDetails'
import { TagDetails } from '@/app/features/entityEditor/tag/details/TagDetails'
import { useMobileLayout } from '@/app/hooks/useMobileLayout'
import { WikiOutlinerDrawer } from '@/app/views/world/components/WikiOutlinerDrawer'
import { useCheckRouteMatch } from '@/router-utils/hooks/useCheckRouteMatch'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { ArticleList } from './articleList/ArticleList'
import { ArticleListEntityGroupButton } from './articleList/ArticleListEntityGroupButton'
import { ArticleListHeader } from './articleList/ArticleListHeader'
import { useCurrentArticle } from './hooks/useCurrentArticle'

export const Wiki = () => {
	const isArticle = useCheckRouteMatch('/world/$worldId/wiki/$articleId')
	const { isMobile } = useMobileLayout()

	const showList = !isMobile || !isArticle
	const showContent = !isMobile || isArticle

	const articleList = (
		<Stack
			sx={{
				width: '100%',
				minWidth: 0,
				height: '100%',
			}}
			data-testid="ArticleListWithHeader"
		>
			<Stack gap={1} height={1}>
				<Stack gap={1}>
					<ArticleListHeader />
					<Divider />
					<ArticleListEntityGroupButton />
				</Stack>
				<ArticleList parentId={null} depth={0} />
			</Stack>
		</Stack>
	)

	return (
		<Stack
			sx={{
				width: '100%',
				height: '100%',
				alignItems: isMobile ? 'flex-start' : 'stretch',
				flexDirection: isMobile ? 'column' : 'row',
				gap: isMobile ? 2 : 0,
				overflowX: 'hidden',
				overflowY: isMobile ? 'auto' : undefined,
			}}
		>
			{isMobile && showList && (
				<Paper
					sx={{
						padding: 2,
						paddingTop: '24px',
						paddingBottom: 0,
						height: '100%',
						maxHeight: '100%',
						width: '100%',
						boxSizing: 'border-box',
						display: 'flex',
						flexDirection: 'row',
						borderRadius: 0,
						overflowX: 'hidden',
					}}
					elevation={1}
				>
					{articleList}
				</Paper>
			)}
			{!isMobile && <WikiOutlinerDrawer>{articleList}</WikiOutlinerDrawer>}
			{showContent && (
				<Stack
					sx={{
						flex: 1,
						paddingTop: isMobile ? '12px' : '24px',
						paddingX: isMobile ? '8px' : 2,
						alignItems: 'center',
						height: isMobile ? '100%' : 'calc(100% - 24px)',
						width: isMobile ? 'calc(100% - 16px)' : undefined,
						overflowY: 'auto',
					}}
				>
					{isArticle && (
						<Stack gap={1} height={'calc(100%)'} sx={{ maxWidth: 1278, width: '100%', flex: 1 }}>
							<Box height={'calc(100% - 1px)'}>{<Outlet />}</Box>
						</Stack>
					)}
				</Stack>
			)}
		</Stack>
	)
}

export function CurrentArticleDetails() {
	const { article } = useCurrentArticle()
	const navigate = useStableNavigate({ from: '/world/$worldId/wiki/$articleId' })
	const { isMobile } = useMobileLayout()

	if (!article) {
		return null
	}

	const startAdornment = isMobile ? (
		<Stack direction="row" gap={0.5} marginRight={0.5} alignItems="center">
			<Tooltip title="Back to articles" disableInteractive enterDelay={400}>
				<IconButton
					size="small"
					onClick={() => navigate({ to: '/world/$worldId/wiki', search: true })}
					edge="start"
					sx={{ padding: '6px' }}
				>
					<ArrowBackIcon fontSize="small" />
				</IconButton>
			</Tooltip>
			<Divider orientation="vertical" sx={{ height: 24 }} />
		</Stack>
	) : undefined

	switch (article.type) {
		case 'article':
			return (
				<ArticleDetails article={article.entity} isWikiTab titleProps={{ startAdornment }} surface="wiki" />
			)
		case 'actor':
			return <ActorDetails editedActor={article.entity} surface="wiki" />
		case 'event':
			return <EventDetails editedEvent={article.entity} surface="wiki" />
		case 'tag':
			return <TagDetails editedTag={article.entity} />
	}
	return null
}
