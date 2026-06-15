import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { useMatches } from '@tanstack/react-router'
import { memo, useCallback, useMemo } from 'react'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useColorUtils } from '@/app/utils/colors/useColorUtils'
import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'
import { useArticleDragDrop } from '@/app/views/world/views/wiki/hooks/useArticleDragDrop'
import { useStableNavigate } from '@/router-utils/hooks/useStableNavigate'

import { BoxedWikiEntity } from '../hooks/useBoxedWikiContent'
import { ArticleList } from './ArticleList'
import { ArticleListItemContextMenu } from './ArticleListItemContextMenu'
import { ArticleListItemEndAdornment } from './ArticleListItemEndAdornment'
import { ArticleListItemSecondary } from './ArticleListItemSecondary'
import { useArticleCollapseControls } from './hooks/useArticleCollapseControls'
import { useIsFolderGrayedOut } from './hooks/useIsFolderGrayedOut'
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

	return (
		<Box
			data-testid={`ArticleListItem/${article.name}/${depth}`}
			data-item-type={article.type}
			sx={{
				pointerEvents: 'none',
			}}
		>
			<Stack
				ref={ref}
				direction="row"
				position="relative"
				sx={{
					pointerEvents: 'auto',
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
						'&::after': {
							content: '""',
							position: 'absolute',
							left: 0,
							right: 0,
							top: 'calc(-1 * var(--hit-gap))',
							bottom: 'calc(-1 * var(--hit-gap))',
						},
						justifyContent: 'start',
						paddingLeft: 1.5,
						paddingRight: '8px',
						filter: isGrayscale ? 'grayscale(70%)' : 'none',
					}}
					fullWidth
					onClick={onNavigate}
				>
					<Stack direction="column" alignItems="flex-start" sx={{ width: '100%', minWidth: 0 }}>
						<Box
							sx={{
								lineHeight: '1.3rem',
								maxWidth: '100%',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{article.name}
						</Box>
						<ArticleListItemSecondary entity={article} highlighted={highlighted} />
					</Stack>
					<Box
						className="end-adornment"
						sx={{ opacity: isContextMenuOpen ? 0 : 1, transition: 'opacity 0.15s' }}
					>
						<ArticleListItemEndAdornment article={article} color={color} />
					</Box>
				</Button>
				{!isReadOnly && (
					<ArticleListItemContextMenu
						article={article}
						color={color}
						onContextMenu={onContextMenu}
						isContextMenuOpen={isContextMenuOpen}
					/>
				)}
				{ghostElement}
			</Stack>
			{article.type === 'folder' && (
				<Collapse in={expanded} unmountOnExit sx={{ paddingLeft: 1 }}>
					<ArticleList color={article.color} parentId={article.id} depth={depth + 1} />
				</Collapse>
			)}
		</Box>
	)
}
