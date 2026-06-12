import Add from '@mui/icons-material/Add'
import MoreVert from '@mui/icons-material/MoreVert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { useMatches } from '@tanstack/react-router'
import { memo, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { RootState } from '@/app/store'
import { useColorUtils } from '@/app/utils/colors/useColorUtils'
import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'
import { useArticleDragDrop } from '@/app/views/world/views/wiki/hooks/useArticleDragDrop'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { BoxedWikiEntity } from '../hooks/useBoxedWikiContent'
import { useFolderEntityCount } from '../hooks/useFolderEntityCount'
import { ArticleList } from './ArticleList'
import { ArticleListItemSecondary } from './ArticleListItemSecondary'
import { useArticleCollapseControls } from './hooks/useArticleCollapseControls'
import { ArticleListItemIcon } from './icon/ArticleListItemIcon'

type Props = {
	article: BoxedWikiEntity
	depth: number
	checkboxVisible: boolean
	checked: boolean
	onCheckboxChange: (article: BoxedWikiEntity, event: React.ChangeEvent<HTMLInputElement>) => void
	onContextMenu: (article: BoxedWikiEntity, event: React.MouseEvent) => void
	isContextMenuOpen: boolean
}

export const ArticleListItem = memo(ArticleListItemComponent)

function ArticleListItemComponent({ article, ...props }: Props) {
	const { toggleOpen, collapsed } = useArticleCollapseControls(article)

	const matches = useMatches()
	const highlighted = matches.some(
		(match) =>
			match.routeId === '/world/$worldId/_world/wiki/_wiki/$articleId' &&
			match.params.articleId === article.id,
	)

	return (
		<ArticleListItemInner
			article={article}
			expanded={!collapsed}
			toggleOpen={toggleOpen}
			highlighted={highlighted}
			{...props}
		/>
	)
}

export const ArticleListItemInner = memo(ArticleListItemInnerComponent)

function ArticleListItemInnerComponent({
	article,
	depth,
	expanded,
	checkboxVisible,
	checked,
	onCheckboxChange,
	toggleOpen,
	highlighted,
	onContextMenu,
	isContextMenuOpen,
}: Props & { expanded: boolean; toggleOpen: () => void; highlighted: boolean }) {
	const navigate = useStableNavigate({ from: '/world/$worldId' })
	const folderCount = useFolderEntityCount({ id: article.id, entityType: article.type })

	const { isReadOnly } = useIsReadOnly()

	const onNavigate = useCallback(() => {
		if (highlighted || article.type === 'folder') {
			toggleOpen()
		} else {
			navigate({
				to: '/world/$worldId/wiki/$articleId',
				params: { articleId: article.id },
				search: true,
			})
		}
	}, [highlighted, article.type, article.id, toggleOpen, navigate])

	const { ref, ghostElement } = useArticleDragDrop({ article })
	const isGrayscale = useIsFolderGrayedOut(article)
	const theme = useCustomTheme()
	const { setOpacity } = useColorUtils()
	const entityColor = setOpacity(article.color, 0.1)
	const entityColorHover = setOpacity(article.color, 0.15)

	const color = useMemo(() => {
		if (highlighted && theme.mode === 'light') {
			return 'primary.contrastText'
		}
		return 'text.secondary'
	}, [highlighted, theme.mode])

	const endAdornment = useMemo(() => {
		if (article.type !== 'folder') {
			return (
				<Box
					component="span"
					sx={{
						color,
						fontSize: '0.7rem',
						textTransform: 'uppercase',
						whiteSpace: 'nowrap',
						ml: 1,
						fontFamily: 'Inter',
						transition: 'color 0.1s ease-out',
					}}
				>
					{article.type}
				</Box>
			)
		}

		return (
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="center"
				sx={{
					boxSizing: 'border-box',
					minWidth: 24,
					minHeight: 24,
					maxHeight: 24,
					px: 0.75,
					whiteSpace: 'nowrap',
					flexShrink: 0,
					fontSize: 13,
					color: 'text.secondary',
					backgroundColor: theme.custom.palette.neutralBackground.normal,
					borderRadius: '12px',
				}}
			>
				{folderCount}
			</Stack>
		)
	}, [article.type, color, folderCount, theme.custom.palette.neutralBackground.normal])

	return (
		<Box data-testid={`ArticleListItem/${article.name}/${depth}`} data-item-type={article.type}>
			<Stack
				ref={ref}
				direction="row"
				position={'relative'}
				sx={{
					'&:hover .context-menu-button': {
						opacity: 1,
					},
					'&:hover .end-adornment': {
						opacity: 0,
					},
				}}
			>
				{checkboxVisible && (
					<Checkbox
						size="small"
						checked={checked}
						onChange={(event) => onCheckboxChange(article, event)}
					></Checkbox>
				)}
				<Button
					role="button"
					startIcon={<ArticleListItemIcon article={article} highlighted={highlighted} />}
					variant={highlighted ? 'contained' : 'text'}
					color="primary"
					onContextMenu={(event) => {
						event.preventDefault()
						onContextMenu(article, event)
					}}
					sx={{
						background: article.type === 'folder' ? entityColor : undefined,
						'&:hover': {
							background: article.type === 'folder' ? entityColorHover : undefined,
						},
						borderRadius: '6px',
						justifyContent: 'start',
						paddingLeft: 1.5,
						paddingRight: '8px',
						filter: isGrayscale ? 'grayscale(70%)' : 'none',
					}}
					fullWidth
					onClick={onNavigate}
				>
					<Stack direction="row" alignItems="space-between" sx={{ width: '100%' }}>
						<Stack direction="column" alignItems="flex-start">
							<Box sx={{ lineHeight: '1.3rem' }}>{article.name}</Box>
							<ArticleListItemSecondary entity={article} highlighted={highlighted} />
						</Stack>
					</Stack>
					{
						<Stack
							className="end-adornment"
							sx={{ opacity: isContextMenuOpen ? 0 : 1, transition: 'opacity 0.15s' }}
						>
							{endAdornment}
						</Stack>
					}
				</Button>
				{!isReadOnly && (
					<>
						<Button
							aria-label="Article context menu"
							className="context-menu-button"
							onClick={(event) => {
								onContextMenu(article, event)
								event.stopPropagation()
							}}
							color="inherit"
							onMouseDown={(event) => event.stopPropagation()}
							sx={{
								position: 'absolute',
								right: 0,
								top: 0,
								bottom: 0,
								width: 36,
								minWidth: 0,
								height: 'auto',
								borderRadius: '8px',
								color: color,
								opacity: isContextMenuOpen ? 1 : 0,
								backgroundColor: isContextMenuOpen ? 'action.hover' : 'transparent',
								'&:hover': {
									backgroundColor: 'action.hover',
								},
								transition: 'color 0.2s, background-color 0.2s, opacity 0.15s !important',
								padding: 0,
							}}
						>
							<MoreVert />
						</Button>
						{article.type === 'folder' && (
							<Button
								aria-label="Folder create menu"
								className="context-menu-button"
								onClick={(event) => {
									onContextMenu(article, event)
									event.stopPropagation()
								}}
								color="inherit"
								onMouseDown={(event) => event.stopPropagation()}
								sx={{
									position: 'absolute',
									right: 36,
									top: 0,
									bottom: 0,
									width: 36,
									minWidth: 0,
									height: 'auto',
									borderRadius: '8px',
									color: theme.custom.palette.hintText,
									opacity: isContextMenuOpen ? 1 : 0,
									backgroundColor: isContextMenuOpen ? 'action.hover' : 'transparent',
									'&:hover': {
										backgroundColor: 'action.hover',
									},
									transition: 'color 0.2s, background-color 0.2s, opacity 0.15s !important',
									padding: 0,
								}}
							>
								<Add />
							</Button>
						)}
					</>
				)}
				{ghostElement}
			</Stack>
			{article.type === 'folder' && (
				<Collapse in={expanded} unmountOnExit>
					<ArticleList color={article.color} parentId={article.id} depth={depth + 1} />
				</Collapse>
			)}
		</Box>
	)
}

function useIsFolderGrayedOut(article: BoxedWikiEntity) {
	const folderId = article.type === 'folder' ? article.id : null

	return useSelector((state: RootState) => {
		if (!folderId) {
			return false
		}

		const { folders, articles } = state.wiki
		const { actors, events, tags } = state.world
		const { visibleEntities } = state.preferences.wiki

		function hasVisibleEntity(id: string): boolean {
			if (
				(visibleEntities.includes('actor') && actors.some((a) => a.parentFolderId === id)) ||
				(visibleEntities.includes('article') && articles.some((a) => a.parentFolderId === id)) ||
				(visibleEntities.includes('event') && events.some((e) => e.parentFolderId === id)) ||
				(visibleEntities.includes('tag') && tags.some((t) => t.parentFolderId === id))
			) {
				return true
			}
			return folders.filter((f) => f.parentFolderId === id).some((f) => hasVisibleEntity(f.id))
		}

		return !hasVisibleEntity(folderId)
	})
}
