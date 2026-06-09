import Add from '@mui/icons-material/Add'
import MoreVert from '@mui/icons-material/MoreVert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { useMatches } from '@tanstack/react-router'
import { memo, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { ActorAvatar } from '@/app/components/ActorAvatar/ActorAvatar'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { RootState } from '@/app/store'
import { getContrastTextColor } from '@/app/utils/colors/getContrastTextColor'
import { useEntityColor } from '@/app/utils/colors/useEntityColor'
import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'
import { useArticleDragDrop } from '@/app/views/world/views/wiki/hooks/useArticleDragDrop'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'
import { CustomEntityIcon } from '@/ui-lib/icons/CustomEntityIcon'
import { EntityIcon } from '@/ui-lib/icons/EntityIcon'

import { BoxedWikiEntity } from '../hooks/useBoxedWikiContent'
import { ArticleList } from './ArticleList'
import { ArticleListItemCollapse } from './ArticleListItemCollapse'
import { ArticleListItemSecondary } from './ArticleListItemSecondary'
import { useArticleCollapseControls } from './hooks/useArticleCollapseControls'

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
	if (article.type === 'actor') {
		console.log(article.entity.title, article.entity.updatedAt)
	}

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
	const entityColor = useEntityColor({ id: article.id, color: article.color, opacity: 0.1 })
	const entityColorHover = useEntityColor({ id: article.id, color: article.color, opacity: 0.15 })
	const entityColorSolid = useEntityColor({ id: article.id, color: article.color })

	const endAdornment = useMemo(() => {
		// if (article.type !== 'folder') {
		// 	return undefined
		// }
		if (article.type !== 'folder') {
			return (
				<Box
					component="span"
					sx={{
						color: 'text.secondary',
						fontSize: '0.7rem',
						textTransform: 'uppercase',
						whiteSpace: 'nowrap',
						ml: 1,
						fontFamily: 'Inter',
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
					minWidth: 24,
					maxWidth: 24,
					minHeight: 24,
					maxHeight: 24,
					fontSize: 13,
					color: 'text.secondary',
					backgroundColor: theme.custom.palette.neutralBackground.normal,
					borderRadius: '50%',
				}}
			>
				4
			</Stack>
		)
	}, [article.type, theme])

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
					startIcon={
						<>
							{article.type === 'folder' && <ArticleListItemCollapse entity={article} />}
							{article.type !== 'event' && article.type !== 'actor' && <EntityIcon variant={article.type} />}
							{article.type === 'actor' && <ActorAvatar actor={article.entity} />}
							{article.type === 'event' && (
								<Avatar sx={{ backgroundColor: article.entity.color }}>
									<CustomEntityIcon
										id={article.id}
										height={24}
										icon={article.entity.icon}
										color={getContrastTextColor(article.entity.color)}
									/>
								</Avatar>
							)}
						</>
					}
					variant={highlighted ? 'contained' : 'text'}
					color="secondary"
					sx={{
						background: article.type === 'folder' ? entityColor : undefined,
						'&:hover': {
							background: article.type === 'folder' ? entityColorHover : undefined,
						},
						borderRadius: '6px',
						justifyContent: 'start',
						paddingLeft: 1.5,
						paddingRight: '8px',
						transition: expanded ? 'border-radius 0.1s !important' : 'border-radius 0.5s !important',
						transitionDelay: !expanded ? '0.2s !important' : '0s',
						// paddingRight: '40px',
						filter: isGrayscale ? 'grayscale(70%)' : 'none',
					}}
					fullWidth
					onClick={onNavigate}
				>
					<Stack direction="row" alignItems="space-between" sx={{ width: '100%' }}>
						<Stack direction="column" alignItems="flex-start">
							<Box sx={{ lineHeight: '1.3rem' }}>
								<Stack direction="row" alignItems="center" justifyContent="center" display="inline-flex">
									{/* {article.type !== 'event' && article.type !== 'tag' && article.type !== 'folder' && (
										<CustomEntityColor id={article.id} height={14} color={article.entity.color} />
									)} */}
									{/* {article.type === 'event' && (
										<CustomEntityIcon
											id={article.id}
											height={18}
											icon={article.entity.icon}
											color={article.entity.color}
										/>
									)} */}
									{article.name}
								</Stack>
							</Box>
							<ArticleListItemSecondary entity={article} />
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
				</Button>
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
