import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import { useMemo } from 'react'

import { useListArticles } from '@/app/views/world/api/useListArticles'

import { ArticleListItem } from './ArticleListItem'

export const ArticleList = () => {
	const { data: articles } = useListArticles()

	const sortedArticles = useMemo(
		() => [...(articles ?? [])].sort((a, b) => a.position - b.position),
		[articles],
	)

	return (
		<Stack direction="column">
			{sortedArticles.length > 0 ? (
				sortedArticles.map((article) => <ArticleListItem key={article.id} article={article} />)
			) : (
				<ListItemButton>Nothing has been created yet!</ListItemButton>
			)}
		</Stack>
	)
}
