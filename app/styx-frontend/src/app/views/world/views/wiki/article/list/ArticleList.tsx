import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import { useMemo } from 'react'

import { useListArticles } from '@/app/views/world/api/useListArticles'

import { ArticleDropHandle } from '../../components/ArticleDropHandle'
import { ArticleListItem } from './ArticleListItem'

type Props = {
	parentId: string | null
}

export const ArticleList = ({ parentId }: Props) => {
	const { data: articles } = useListArticles({ parentId })

	const sortedArticles = useMemo(
		() => [...(articles ?? [])].sort((a, b) => a.position - b.position),
		[articles],
	)

	return (
		<Stack direction="column" marginLeft={parentId ? 2 : 0}>
			{sortedArticles.length === 0 && <ListItemButton>Nothing has been created yet!</ListItemButton>}
			{sortedArticles.length > 0 && <ArticleDropHandle position={0} parentId={parentId} />}
			{sortedArticles.map((article) => (
				<span key={article.id}>
					<ArticleListItem article={article} />
					<ArticleDropHandle position={0} parentId={article.id} marginLeft={2} />
					{article.children && article.children.length > 0 && <ArticleList parentId={article.id} />}
					<ArticleDropHandle position={article.position + 1} parentId={parentId} />
				</span>
			))}
		</Stack>
	)
}
