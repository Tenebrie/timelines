import Button from '@mui/material/Button'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { preferencesSlice } from '@/app/features/preferences/PreferencesSlice'
import { EntityIcon } from '@/ui-lib/icons/EntityIcon'

import { useMoveArticle } from '../api/useMoveArticle'
import { BoxedWikiEntity } from './useBoxedWikiContent'

type Props = {
	article: BoxedWikiEntity
}

export const useArticleDragDrop = ({ article }: Props) => {
	const [moveArticle] = useMoveArticle()

	const { uncollapseWikiFolder } = preferencesSlice.actions
	const dispatch = useDispatch()
	const forceOpen = useCallback(() => {
		dispatch(uncollapseWikiFolder(article))
	}, [dispatch, uncollapseWikiFolder, article])

	const { ref, ghostElement } = useDragDrop({
		type: 'articleListItem',
		ghostFactory: () => (
			<Button
				startIcon={<EntityIcon variant={article.type} />}
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
		onDrop: async ({ params }, event) => {
			event.markHandled()
			if (params.article.id === article.id || article.type !== 'folder') {
				return
			}
			await moveArticle({
				entityId: params.article.id,
				entityType: params.article.type,
				parentId: article.id,
				// Always the last position
				position: 999999,
			})

			requestIdleCallback(forceOpen, { timeout: 250 })
		},
	})

	return {
		ref,
		ghostElement,
	}
}
