import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { memo, useRef } from 'react'

import { useDragDropReceiver } from '@/app/features/dragDrop/hooks/useDragDropReceiver'
import { useBrowserSpecificScrollbars } from '@/app/hooks/useBrowserSpecificScrollbars'

import { useMoveArticle } from '../api/useMoveArticle'
import { ArticleDropHandle } from '../components/ArticleDropHandle'
import { useBoxedWikiContent } from '../hooks/useBoxedWikiContent'
import { ArticleListItem } from './ArticleListItem'

type Props = {
	parentId: string | null
	depth: number
}

export const ArticleList = memo(ArticleListComponent)

export function ArticleListComponent({ parentId, depth }: Props) {
	const [moveArticle] = useMoveArticle()

	// const { articles } = useSelector(getWikiState, (a, b) => a.articles === b.articles)
	const sortedArticles = useBoxedWikiContent({ filterFolderId: parentId })

	const ref = useRef<HTMLDivElement>(null)
	useDragDropReceiver({
		type: 'articleListItem',
		receiverRef: ref,
		onDrop: ({ params }) => {
			moveArticle({
				entityId: params.article.id,
				entityType: params.article.type,
				parentId: null,
				position: 9999,
			})
		},
	})

	return (
		<Stack
			ref={ref}
			direction="column"
			height={1}
			sx={{
				marginLeft: parentId ? 2 : 0,
				marginRight: -0.5,
				paddingRight: 1.5,
				height: '100%',
				overflowY: 'auto',
				...useBrowserSpecificScrollbars(),
			}}
			data-testid={`ArticleList/${depth}`}
		>
			{sortedArticles.length === 0 && (
				<Typography variant="body2" color="text.secondary" sx={{ py: 1, pl: 1 }}>
					{parentId && <span>Folder is empty!</span>}
					{!parentId && <span>Nothing has been created yet!</span>}
				</Typography>
			)}
			{sortedArticles.map((article) => (
				<span key={article.id}>
					<ArticleDropHandle position={article.position} parentId={parentId} />
					<ArticleListItem article={article} depth={depth} />
				</span>
			))}
		</Stack>
	)
}
