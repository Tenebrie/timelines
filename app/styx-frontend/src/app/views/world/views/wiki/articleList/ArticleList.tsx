import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { usePopupState } from 'material-ui-popup-state/hooks'
import { memo, useCallback, useRef, useState } from 'react'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'

import { useMoveArticle } from '../api/useMoveArticle'
import { ArticleContextMenu } from '../components/ArticleContextMenu'
import { ArticleDropHandle } from '../components/ArticleDropHandle'
import { useArticleBulkActions } from '../hooks/useArticleBulkActions'
import { BoxedWikiEntity, useBoxedWikiContent } from '../hooks/useBoxedWikiContent'
import { ArticleListItem } from './ArticleListItem'

type Props = {
	parentId: string | null
	depth: number
}

export const ArticleList = memo(ArticleListComponent)

export function ArticleListComponent({ parentId, depth }: Props) {
	const [moveArticle] = useMoveArticle()
	const [contextMenuArticle, setContextMenuArticle] = useState<BoxedWikiEntity | null>(null)

	const sortedArticles = useBoxedWikiContent({ filterFolderId: parentId })
	const { checkboxVisible, isChecked, onChange } = useArticleBulkActions({ articles: sortedArticles })

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

	return (
		<Stack
			ref={ref}
			direction="column"
			height={1}
			sx={{
				marginLeft: parentId ? 2 : 0,
				marginRight: -0.5,
				paddingRight: 1.5,
				height: '100%',
				overflowY: 'auto',
				...useBrowserSpecificScrollbars(),
			}}
			data-testid={`ArticleList/${depth}`}
		>
			{sortedArticles.length === 0 && (
				<Typography variant="body2" color="text.secondary" sx={{ py: 1, pl: 1 }}>
					{parentId && <span>Folder is empty!</span>}
					{!parentId && <span>Nothing has been created yet!</span>}
				</Typography>
			)}
			{sortedArticles.map((article) => (
				<span key={article.id}>
					<ArticleDropHandle position={article.position} parentId={parentId} />
					<ArticleListItem
						article={article}
						depth={depth}
						onContextMenu={openContextMenu}
						checkboxVisible={checkboxVisible}
						checked={isChecked(article)}
						onCheckboxChange={onChange}
					/>
				</span>
			))}
			{contextMenuArticle && (
				<ArticleContextMenu article={contextMenuArticle} popupState={contextMenuState} />
			)}
		</Stack>
	)
}
