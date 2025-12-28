import { WikiArticle } from '@api/types/worldWikiTypes'
import Article from '@mui/icons-material/Article'
import Folder from '@mui/icons-material/Folder'
import Button from '@mui/material/Button'
import { useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'

import { useMoveArticle } from '../api/useMoveArticle'

type Props = {
	article: WikiArticle
}

export const useArticleDragDrop = ({ article }: Props) => {
	const [moveArticle] = useMoveArticle()

	const { uncollapseWikiFolder } = preferencesSlice.actions
	const dispatch = useDispatch()
	const forceOpen = useCallback(() => {
		dispatch(uncollapseWikiFolder(article))
	}, [dispatch, uncollapseWikiFolder, article])

	const icon = useMemo(() => (article.children?.length ? <Folder /> : <Article />), [article.children])

	const { ref, ghostElement } = useDragDrop({
		type: 'articleListItem',
		ghostFactory: () => (
			<Button
				startIcon={icon}
				color="secondary"
				variant="contained"
				sx={{ justifyContent: 'start', opacity: 0.5, width: '200px' }}
			>
				{article.name}
			</Button>
		),
		params: { article },
	})

	useDragDropReceiver({
		type: 'articleListItem',
		receiverRef: ref,
		onDrop: ({ params }, event) => {
			event.markHandled()
			if (params.article.id === article.id) {
				return
			}
			moveArticle({
				articleId: params.article.id,
				parentId: article.id,
				// Always the last position
				position: 9999,
			})
			forceOpen()
		},
	})

	return {
		ref,
		ghostElement,
	}
}
