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
				entityId: params.article.id,
				entityType: params.article.type,
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
				width: 'calc(100%)',
				height: '32px',
				padding: '0 0px',
				margin: '-12px 0',
				position: 'relative',
				zIndex: 200,
				marginLeft,
				alignItems: 'center',
				justifyContent: 'center',
				pointerEvents: isDragging ? 'auto' : 'none',
				...(isDragging && {
					'& > *': { backgroundColor: theme.custom.palette.background.soft },
					'&:hover > *': { backgroundColor: theme.custom.palette.background.hardest },
				}),
			}}
		>
			<Box
				sx={{ width: '100%', height: '6px', transition: 'background-color 0.3s', borderRadius: '4px' }}
			></Box>
		</Stack>
	)
}
