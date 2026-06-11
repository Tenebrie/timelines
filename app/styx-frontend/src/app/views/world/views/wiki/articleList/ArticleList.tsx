import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { usePopupState } from 'material-ui-popup-state/hooks'
import { memo, useCallback, useRef, useState } from 'react'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'
import { useColorUtils } from '@/app/utils/colors/useColorUtils'

import { useMoveArticle } from '../api/useMoveArticle'
import { ArticleContextMenu } from '../components/ArticleContextMenu'
import { ArticleDropHandle } from '../components/ArticleDropHandle'
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
 * - Create in folder
 * - Create new to create at the position of the currently selected entity (after)
 * - Event moving from the wiki view
 * - Event moving after clicking "Edit" without selection (Timeline view)
 * - Mention list bugging out (Neverkin Lore / Neverkin tag)
 * - Right click to open context menu
 * - Deletion modal invalid text
 * - Mentions to navigate within wiki view (if in wiki view)
 * - Actor avatars, for real this time
 * - Article color picker
 * - Folder color picker
 * - Scroll wiki list during drag (hover close to edges)
 */
export const ArticleList = memo(ArticleListComponent)

export function ArticleListComponent({ parentId, color, depth }: Props) {
	const [moveArticle] = useMoveArticle()
	const [contextMenuArticle, setContextMenuArticle] = useState<BoxedWikiEntity | null>(null)

	const { visibleEntities, hiddenCount } = useBoxedWikiContent({ filterFolderId: parentId })
	const { checkboxVisible, isChecked, onChange } = useArticleBulkActions({ articles: visibleEntities })

	const ref = useRef<HTMLDivElement>(null)
	useDragDropReceiver({
		type: 'articleListItem',
		receiverRef: ref,
		onDrop: ({ params }) => {
			moveArticle({
				entityId: params.article.id,
				entityType: params.article.type,
				parentId: null,
				position: 99999,
			})
		},
	})

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

	return (
		<Stack
			ref={ref}
			direction="column"
			height={1}
			sx={{
				background: parentId ? folderColor : 'transparent',
				marginLeft: parentId ? 1 : 0,
				paddingLeft: parentId ? 1 : 0,
				marginRight: parentId ? 0 : -2,
				paddingRight: parentId ? 0 : 2,
				borderRadius: '0 6px 6px 6px',
				height: '100%',
				paddingBottom: parentId ? '4px' : '50vh',
				overflowY: 'auto',
				borderLeft: parentId ? `2px solid` : 'none',
				borderColor: fullColor,
				...useBrowserSpecificScrollbars(),
			}}
			data-testid={`ArticleList/${depth}`}
		>
			{visibleEntities.map((article) => (
				<span key={article.id}>
					<ArticleDropHandle position={article.position} parentId={parentId} />
					<ArticleListItem
						article={article}
						depth={depth}
						onContextMenu={openContextMenu}
						checkboxVisible={checkboxVisible}
						checked={isChecked(article)}
						onCheckboxChange={onChange}
						isContextMenuOpen={contextMenuState.isOpen && contextMenuArticle?.id === article.id}
					/>
				</span>
			))}
			{(hiddenCount > 0 || visibleEntities.length === 0) && (
				<Typography variant="body2" color="text.secondary" sx={{ py: 1, pl: 1 }}>
					{parentId && hiddenCount === 0 && <span>Folder is empty!</span>}
					{hiddenCount > 0 && (
						<Typography variant="caption" fontStyle={'italic'} color={theme.custom.palette.hintText}>
							+{hiddenCount} hidden
						</Typography>
					)}
					{!parentId && visibleEntities.length === 0 && <span>Nothing has been created yet!</span>}
				</Typography>
			)}
			{contextMenuArticle && (
				<ArticleContextMenu article={contextMenuArticle} popupState={contextMenuState} />
			)}
		</Stack>
	)
}
