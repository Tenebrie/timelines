import Menu from '@mui/icons-material/Menu'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useDragDrop } from '@/app/features/dragDrop/useDragDrop'
import { getWorldIdState } from '@/app/features/world/selectors'
import { useWorldWikiRouter, worldWikiRoutes } from '@/router/routes/featureRoutes/worldWikiRoutes'

import { getWikiState } from '../../selectors'
import { WikiArticle } from '../../types'

type Props = {
	article: WikiArticle
}

export const ArticleListItem = ({ article }: Props) => {
	const worldId = useSelector(getWorldIdState)
	const { bulkActionArticles } = useSelector(getWikiState)
	const { navigateTo } = useWorldWikiRouter()

	const onNavigate = useCallback(() => {
		navigateTo({
			target: worldWikiRoutes.article,
			args: {
				worldId,
				articleId: article.id,
			},
		})
	}, [article.id, navigateTo, worldId])

	const { ref, ghostElement } = useDragDrop({
		type: 'articleListItem',
		ghostFactory: () => (
			<Button
				color="secondary"
				variant="contained"
				sx={{ justifyContent: 'start', opacity: 0.5, width: '100%' }}
				fullWidth
				onClick={onNavigate}
			>
				{article.name}
			</Button>
		),
		params: { article },
	})

	return (
		<Stack ref={ref} direction="row">
			{bulkActionArticles.length > 0 && <Checkbox></Checkbox>}
			<Button color="secondary" sx={{ justifyContent: 'start' }} fullWidth onClick={onNavigate}>
				{article.name}
			</Button>
			<IconButton color="secondary">
				<Menu />
			</IconButton>
			{ghostElement}
		</Stack>
	)
}
