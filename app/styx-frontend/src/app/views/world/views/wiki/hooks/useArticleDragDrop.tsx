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
	isDropHandle?: boolean
}

export const useArticleDragDrop = ({ article, isDropHandle }: Props) => {
	const [moveArticle] = useMoveArticle()

	const { uncollapseWikiFolder } = preferencesSlice.actions
	const dispatch = useDispatch()
	const forceOpen = useCallback(() => {
		dispatch(uncollapseWikiFolder(article))
	}, [dispatch, uncollapseWikiFolder, article])

	const { ref, ghostElement } = useDragDrop({
		type: 'articleListItem',
		ghostAlign: {
			top: 'center',
			left: 'center',
		},
		ghostFactory: () => (
			<Button
				startIcon={<EntityIcon variant={article.type} />}
				color="secondary"
				variant="contained"
				sx={{ justifyContent: 'start', opacity: 0.3, width: '300px', filter: 'grayscale(100%)' }}
			>
				{article.name}
			</Button>
		),
		params: { article },
	})

	useDragDropReceiver({
		type: 'articleListItem',
		receiverRef: ref,
		onDrop: async ({ params, targetRootPos }, event) => {
			event.markHandled()
			if (params.article.id === article.id || !ref.current) {
				return
			}

			const targetTop = ref.current.getBoundingClientRect().top
			const delta = targetRootPos.y < targetTop ? 1 : -1
			const dropHandleDelta = isDropHandle && delta > 0 ? -2 : 0
			console.log(delta)

			if (article.entity.parentFolderId !== params.article.entity.parentFolderId) {
				requestIdleCallback(forceOpen, { timeout: 150 })
			}
			await moveArticle({
				entityId: params.article.id,
				entityType: params.article.type,
				parentId: article.entity.parentFolderId,
				position: article.position + delta + dropHandleDelta,
			})
		},
	})

	return {
		ref,
		ghostElement,
	}
}
