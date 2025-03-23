import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useRef } from 'react'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { useDragDropStateWithRenders } from '@/app/features/dragDrop/hooks/useDragDropStateWithRenders'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

import { useMoveArticle } from '../api/useMoveArticle'

type Props = {
	position: number
	parentId: string | null
	marginLeft?: string | number
}

export function ArticleDropHandle({ position, parentId, marginLeft }: Props) {
	const theme = useCustomTheme()
	const [moveArticle] = useMoveArticle()

	const ref = useRef<HTMLDivElement>(null)

	const { isDragging } = useDragDropStateWithRenders()

	useDragDropReceiver({
		type: 'articleListItem',
		receiverRef: ref,
		onDrop: ({ params }, event) => {
			event.markHandled()
			moveArticle({
				articleId: params.article.id,
				parentId,
				position: position - 1,
			})
		},
	})

	return (
		<Stack
			ref={ref}
			data-testid={`ArticleDropHandle/${position}`}
			sx={{
				width: 'calc(100% - 16px)',
				height: '8px',
				padding: '0 8px',
				zIndex: 2,
				marginLeft,
				alignItems: 'center',
				justifyContent: 'center',
				...(isDragging && {
					'& > *': { backgroundColor: theme.custom.palette.background.softer },
					'&:hover > *': { backgroundColor: theme.custom.palette.background.soft },
				}),
			}}
		>
			<Box sx={{ width: '100%', height: '4px', transition: 'background-color 0.3s' }}></Box>
		</Stack>
	)
}
