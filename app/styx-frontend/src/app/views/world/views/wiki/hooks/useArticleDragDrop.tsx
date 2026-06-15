import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { useDragHoverExpand } from '@/app/features/dragDrop/hooks/useDragHoverExpand'

import { useMoveArticle } from '../api/useMoveArticle'
import { useArticleCollapseControls } from '../articleList/hooks/useArticleCollapseControls'
import { ArticleListItemIcon } from '../articleList/icon/ArticleListItemIcon'
import { BoxedWikiEntity } from './useBoxedWikiContent'

type Props = {
	article: BoxedWikiEntity
	isFolderExpanded: boolean
}

export function useArticleDragDrop({ article, isFolderExpanded }: Props) {
	const [moveArticle] = useMoveArticle()
	const { forceOpen } = useArticleCollapseControls(article)

	const { ref, ghostElement } = useDragDrop({
		type: 'articleListItem',
		ghostAlign: {
			top: 'center',
			left: 'center',
		},
		ghostFactory: () => (
			<Button
				startIcon={<ArticleListItemIcon article={article} highlighted={false} />}
				color="secondary"
				variant="contained"
				sx={{ justifyContent: 'start', opacity: 0.3, width: '300px', filter: 'grayscale(100%)' }}
			>
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

			const targetRect = ref.current.getBoundingClientRect()
			const dropY = event.mouseEvent?.clientY ?? targetRootPos.y
			const isTopHalf = dropY < targetRect.top + targetRect.height / 2
			const delta = isTopHalf ? -1 : 1

			if (!isTopHalf && article.type === 'folder' && isFolderExpanded) {
				await moveArticle({
					entityId: params.article.id,
					entityType: params.article.type,
					parentId: article.id,
					position: -1,
				})
				return
			}

			await moveArticle({
				entityId: params.article.id,
				entityType: params.article.type,
				parentId: article.entity.parentFolderId,
				position: article.position + delta,
			})
		},
	})

	useDragHoverExpand({
		type: 'articleListItem',
		targetRef: ref,
		enabled: article.type === 'folder' && !isFolderExpanded,
		onTrigger: forceOpen,
	})

	return {
		ref,
		ghostElement,
	}
}
