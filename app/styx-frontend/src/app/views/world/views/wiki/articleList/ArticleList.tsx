import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { usePopupState } from 'material-ui-popup-state/hooks'
import { memo, useCallback, useRef, useState } from 'react'
import { MouseEvent } from 'react'
import { useDispatch } from 'react-redux'

import { DragDropState } from '@/app/features/dragDrop/DragDropState'
import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { useDragScroll } from '@/app/features/dragDrop/hooks/useDragScroll'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useColorUtils } from '@/app/utils/colors/useColorUtils'

import { useMoveArticle } from '../api/useMoveArticle'
import { WikiContextMenu } from '../components/WikiContextMenu'
import { useArticleBulkActions } from '../hooks/useArticleBulkActions'
import { BoxedWikiEntity, useBoxedWikiContent } from '../hooks/useBoxedWikiContent'
import { ArticleListItem } from './ArticleListItem'

type Props = {
	parentId: string | null
	color?: string
	depth: number
}

/**
 * TODO:
 * - Create new to create at the position of the currently selected entity (after)
 * - Event moving from the wiki view
 * - Event moving after clicking "Edit" without selection (Timeline view)
 * - Deletion modal invalid text
 * - Mentions to navigate within wiki view (if in wiki view)
 * - Actor avatars, for real this time
 */
export const ArticleList = memo(ArticleListComponent)

export function ArticleListComponent({ parentId, color, depth }: Props) {
	const [moveArticle] = useMoveArticle()
	const [contextMenuArticle, setContextMenuArticle] = useState<BoxedWikiEntity | null>(null)

	const { visibleEntities, hiddenCount } = useBoxedWikiContent({ filterFolderId: parentId })
	const { checkboxVisible, isChecked, onChange } = useArticleBulkActions({ articles: visibleEntities })

	const ref = useRef<HTMLDivElement>(null)
	useDragScroll({ type: 'articleListItem', scrollRef: ref, enabled: !parentId })
	useDragDropReceiver({
		type: 'articleListItem',
		receiverRef: ref,
		onDrop: ({ params }, { markHandled }) => {
			moveArticle({
				entityId: params.article.id,
				entityType: params.article.type,
				parentId,
				position: 99999,
			})
			markHandled()
		},
	})
	const { collapseWikiFolderById } = preferencesSlice.actions
	const dispatch = useDispatch()

	const contextMenuState = usePopupState({ variant: 'popover', popupId: 'articleListItem' })
	const contextMenuStateRef = useRef(contextMenuState)
	contextMenuStateRef.current = contextMenuState

	const openContextMenu = useCallback((article: BoxedWikiEntity, event: React.MouseEvent) => {
		setContextMenuArticle(article)
		contextMenuStateRef.current.open(event)
	}, [])
	const theme = useCustomTheme()
	const { setOpacity } = useColorUtils()
	const fullColor = setOpacity(color, 0.3)
	const folderColor = setOpacity(color, 0.04)
	const folderColorHover = setOpacity(color, 0.5)

	const scrollbars = useBrowserSpecificScrollbars()

	const onFolderClick = useCallback(
		(event: MouseEvent) => {
			if (!parentId || event.target !== ref.current || DragDropState.current) {
				return
			}
			dispatch(collapseWikiFolderById(parentId))
			event.stopPropagation()
		},
		[collapseWikiFolderById, dispatch, parentId],
	)

	return (
		<Stack
			ref={ref}
			component={'div'}
			onClick={onFolderClick}
			direction="column"
			height={parentId ? 'auto' : 1}
			sx={{
				position: 'relative',
				pointerEvents: 'auto',
				'--hit-gap': '4px',
				gap: 'calc(2 * var(--hit-gap))',
				background: parentId ? folderColor : 'transparent',
				paddingLeft: parentId ? 1 : 0,
				marginRight: parentId ? 0 : -2,
				paddingRight: parentId ? 0 : 2,
				borderRadius: '0 6px 6px 6px',
				height: parentId ? 'auto' : 'calc(100% + var(--hit-gap))',
				paddingTop: parentId ? 'var(--hit-gap)' : '4px',
				paddingBottom: parentId ? 'calc(var(--hit-gap) * 2)' : '50vh',
				overflowY: parentId ? 'visible' : 'auto',
				borderLeft: parentId ? `2px solid` : 'none',
				borderColor: fullColor,
				cursor: parentId ? 'pointer' : 'default',
				...scrollbars,
				'&:hover:not(:has(*:hover))': {
					borderColor: parentId ? folderColorHover : 'transparent',
				},
				...(parentId && {
					'&::after': {
						content: '""',
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 'calc(var(--hit-gap) * -1)',
						height: 'calc(var(--hit-gap))',
					},
				}),
			}}
			data-testid={`ArticleList/${depth}`}
		>
			{visibleEntities.map((article) => (
				<ArticleListItem
					key={article.id}
					article={article}
					depth={depth}
					onContextMenu={openContextMenu}
					checkboxVisible={checkboxVisible}
					checked={isChecked(article)}
					onCheckboxChange={onChange}
					isContextMenuOpen={contextMenuState.isOpen && contextMenuArticle?.id === article.id}
				/>
			))}
			{(hiddenCount > 0 || visibleEntities.length === 0) && (
				<Typography variant="body2" color="text.secondary" sx={{ py: 1, pl: 1 }}>
					{parentId && hiddenCount === 0 && (
						<Typography variant="caption" fontStyle={'italic'} color={theme.custom.palette.hintText}>
							Empty folder
						</Typography>
					)}
					{hiddenCount > 0 && (
						<Typography variant="caption" fontStyle={'italic'} color={theme.custom.palette.hintText}>
							+{hiddenCount} hidden
						</Typography>
					)}
					{!parentId && visibleEntities.length === 0 && <span>Nothing has been created yet!</span>}
				</Typography>
			)}
			{contextMenuArticle && <WikiContextMenu article={contextMenuArticle} popupState={contextMenuState} />}
		</Stack>
	)
}
