import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import { useCreateArticle } from '../../api/useCreateArticle'
import { useListArticles } from '../../api/useListArticles'
import { ArticleListItem } from './ArticleListItem'

export const ArticleList = () => {
	const { data: articles } = useListArticles()
	const { createArticle } = useCreateArticle()

	const onCreateArticle = () => {
		createArticle({ name: 'New article' })
	}

	return (
		<Stack direction="column">
			{articles && articles.length > 0 ? (
				articles.map((article) => <ArticleListItem key={article.id} article={article} />)
			) : (
				<div>No articles</div>
			)}
			<Button variant="contained" onClick={onCreateArticle}>
				Create new article
			</Button>
		</Stack>
	)
}
