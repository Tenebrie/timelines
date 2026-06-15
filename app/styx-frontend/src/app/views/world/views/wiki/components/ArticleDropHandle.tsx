import Stack from '@mui/material/Stack'

import { useDragDropStateWithRenders } from '@/app/features/dragDrop/hooks/useDragDropStateWithRenders'

import { useArticleDragDrop } from '../hooks/useArticleDragDrop'
import { BoxedWikiEntity } from '../hooks/useBoxedWikiContent'

type Props = {
	article: BoxedWikiEntity
}

export function ArticleDropHandle({ article }: Props) {
	const { isDragging } = useDragDropStateWithRenders()

	const { ref } = useArticleDragDrop({ article, isDropHandle: true })

	return (
		<Stack
			ref={ref}
			data-testid={`ArticleDropHandle/${article.position}`}
			sx={{
				width: 'calc(100%)',
				height: '6px',
				zIndex: 200,
				alignItems: 'center',
				justifyContent: 'center',
				pointerEvents: isDragging ? 'auto' : 'none',
			}}
		/>
	)
}
