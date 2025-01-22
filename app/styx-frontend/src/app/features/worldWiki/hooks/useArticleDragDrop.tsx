import Button from '@mui/material/Button'

import { useDragDrop } from '../../dragDrop/useDragDrop'
import { useDragDropReceiver } from '../../dragDrop/useDragDropReceiver'
import { useSwapArticlePositions } from '../api/useSwapArticlePositions'
import { WikiArticle } from '../types'

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
