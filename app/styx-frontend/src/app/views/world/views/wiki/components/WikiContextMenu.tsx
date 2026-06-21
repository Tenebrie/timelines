import Check from '@mui/icons-material/Check'
import Delete from '@mui/icons-material/Delete'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { bindMenu, PopupState } from 'material-ui-popup-state/hooks'
import { useDispatch, useSelector } from 'react-redux'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { wikiSlice } from '@/app/views/world/views/wiki/WikiSlice'
import { getWikiState } from '@/app/views/world/views/wiki/WikiSliceSelectors'

import { BoxedWikiEntity } from '../hooks/useBoxedWikiContent'
import { WikiContextMenuColorPicker } from './WikiContextMenuColorPicker'

type Props = {
	article: BoxedWikiEntity
	popupState: PopupState
}

export function WikiContextMenu({ article, popupState }: Props) {
	const { bulkActionArticles } = useSelector(getWikiState)
	const { open: openDeleteArticleModal } = useModal('deleteArticleModal')

	const { setLastCheckedArticle, addToBulkSelection, removeFromBulkSelection } = wikiSlice.actions
	const dispatch = useDispatch()

	return (
		<Menu {...bindMenu(popupState)}>
			{!bulkActionArticles.includes(article.id) && (
				<Stack gap={1}>
					<WikiContextMenuColorPicker article={article} onClose={popupState.close} />
					<Divider />
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
				</Stack>
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
