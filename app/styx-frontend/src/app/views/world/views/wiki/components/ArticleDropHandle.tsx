import Box from '@mui/material/Box'
import { useRef } from 'react'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'

import { useMoveArticle } from '../api/useMoveArticle'

type Props = {
	position: number
}

export function ArticleDropHandle({ position }: Props) {
	const [moveArticle] = useMoveArticle()

	const ref = useRef<HTMLDivElement>(null)

	useDragDropReceiver({
		type: 'articleListItem',
		receiverRef: ref,
		onDrop: ({ params }) => {
			const isMovingDown = position > params.article.position
			const targetPosition = isMovingDown ? position - 1 : position
			moveArticle({
				articleId: params.article.id,
				position: targetPosition,
			})
		},
	})

	return (
		<Box
			ref={ref}
			sx={{
				width: '100%',
				height: '8px',
				'body.cursor-grabbing &:hover': { backgroundColor: 'red' },
			}}
		></Box>
	)
}
