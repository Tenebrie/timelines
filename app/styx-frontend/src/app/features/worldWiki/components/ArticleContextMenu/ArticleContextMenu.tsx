import Check from '@mui/icons-material/Check'
import Delete from '@mui/icons-material/Delete'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { bindMenu, PopupState } from 'material-ui-popup-state/hooks'
import { useDispatch, useSelector } from 'react-redux'

import { useModal } from '@/app/features/modals/reducer'

import { wikiSlice } from '../../reducer'
import { getWikiState } from '../../selectors'
import { WikiArticle } from '../../types'

type Props = {
	article: WikiArticle
	popupState: PopupState
}

export const ArticleContextMenu = ({ article, popupState }: Props) => {
	const { bulkActionArticles } = useSelector(getWikiState)
	const { open: openDeleteArticleModal } = useModal('deleteArticleModal')

	const { setLastCheckedArticle, addToBulkSelection, removeFromBulkSelection } = wikiSlice.actions
	const dispatch = useDispatch()

	return (
		<Menu {...bindMenu(popupState)}>
			{!bulkActionArticles.includes(article.id) && (
				<MenuItem
					onClick={() => {
						dispatch(setLastCheckedArticle({ article: article.id }))
						dispatch(addToBulkSelection({ articles: [article.id] }))
						popupState.close()
					}}
				>
					<ListItemIcon>
						<Check />
					</ListItemIcon>
					<ListItemText>Select</ListItemText>
				</MenuItem>
			)}
			{bulkActionArticles.includes(article.id) && (
				<MenuItem
					onClick={() => {
						dispatch(setLastCheckedArticle({ article: article.id }))
						dispatch(removeFromBulkSelection({ articles: [article.id] }))
						popupState.close()
					}}
				>
					<ListItemIcon>
						<Check />
					</ListItemIcon>
					<ListItemText>Unselect</ListItemText>
				</MenuItem>
			)}
			<MenuItem
				color="error"
				onClick={() => {
					openDeleteArticleModal({ articles: [article.id] })
					popupState.close()
				}}
			>
				<ListItemIcon>
					<Delete />
				</ListItemIcon>
				<ListItemText color="error">Delete</ListItemText>
			</MenuItem>
		</Menu>
	)
}
