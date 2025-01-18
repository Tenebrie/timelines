import Menu from '@mui/icons-material/Menu'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { getWorldIdState } from '@/app/features/worldTimeline/selectors'
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

	return (
		<Stack direction="row">
			{bulkActionArticles.length > 0 && <Checkbox></Checkbox>}
			<Button color="secondary" sx={{ justifyContent: 'start' }} fullWidth onClick={onNavigate}>
				{article.name}
			</Button>
			<IconButton color="secondary">
				<Menu />
			</IconButton>
		</Stack>
	)
}
