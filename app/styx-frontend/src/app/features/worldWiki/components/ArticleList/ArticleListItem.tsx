import Menu from '@mui/icons-material/Menu'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { getWorldIdState } from '@/app/features/world/selectors'
import { useWorldWikiRouter, worldWikiRoutes } from '@/router/routes/featureRoutes/worldWikiRoutes'

import { useArticleBulkActions } from '../../hooks/useArticleBulkActions'
import { useArticleDragDrop } from '../../hooks/useArticleDragDrop'
import { WikiArticle } from '../../types'
import { ArticleContextMenu } from '../ArticleContextMenu/ArticleContextMenu'

type Props = {
	article: WikiArticle
}

export const ArticleListItem = ({ article }: Props) => {
	const worldId = useSelector(getWorldIdState)
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

	const { ref, ghostElement } = useArticleDragDrop({ article })

	const popupState = usePopupState({ variant: 'popover', popupId: 'articleListItem' })
	const { checkboxVisible, checked, onChange } = useArticleBulkActions({ article })

	return (
		<Stack ref={ref} direction="row" position={'relative'}>
			{checkboxVisible && <Checkbox size="small" checked={checked} onChange={onChange}></Checkbox>}
			<Button color="secondary" sx={{ justifyContent: 'start' }} fullWidth onClick={onNavigate}>
				{article.name}
			</Button>
			<IconButton color="secondary" {...bindTrigger(popupState)}>
				<Menu />
			</IconButton>
			<ArticleContextMenu article={article} popupState={popupState} />
			{ghostElement}
		</Stack>
	)
}
