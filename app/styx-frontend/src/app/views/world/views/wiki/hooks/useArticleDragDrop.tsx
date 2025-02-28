import Button from '@mui/material/Button'

import { useDragDrop } from '@/app/features/dragDrop/hooks/useDragDrop'
import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { useSwapArticlePositions } from '@/app/views/world/views/wiki/api/useSwapArticlePositions'
import { WikiArticle } from '@/app/views/world/views/wiki/types'

type Props = {
	article: WikiArticle
}

export const useArticleDragDrop = ({ article }: Props) => {
	const [swapArticles] = useSwapArticlePositions()

	const { ref, ghostElement } = useDragDrop({
		type: 'articleListItem',
		ghostFactory: () => (
			<Button
				color="secondary"
				variant="contained"
				sx={{ justifyContent: 'start', opacity: 0.5, width: '100%' }}
				fullWidth
			>
				{article.name}
			</Button>
		),
		params: { article },
	})

	useDragDropReceiver({
		type: 'articleListItem',
		receiverRef: ref,
		onDrop: ({ params }) => {
			swapArticles({
				articleA: article.id,
				articleB: params.article.id,
			})
		},
	})

	return {
		ref,
		ghostElement,
	}
}
