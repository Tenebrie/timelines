import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'

import { useListArticles } from '../../api/useListArticles'
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
				<Typography variant="body1">No articles</Typography>
			)}
		</Stack>
	)
}
