import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useDispatch, useSelector } from 'react-redux'

import { useModal } from '@/app/features/modals/reducer'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'

import { useListArticles } from '../../api/useListArticles'
import { wikiSlice } from '../../reducer'
import { getWikiState } from '../../selectors'

export const ArticleListHeader = () => {
	const { data: articles } = useListArticles()
	const { bulkActionArticles } = useSelector(getWikiState)
	const { open: openArticleWizard } = useModal('articleWizard')
	const { open: openDeleteArticleModal } = useModal('deleteArticleModal')

	const { addToBulkSelection, clearBulkSelection } = wikiSlice.actions
	const dispatch = useDispatch()

	const onChange = () => {
		if (!articles) {
			return
		}
		if (bulkActionArticles.length < articles!.length) {
			dispatch(addToBulkSelection({ articles: articles.map((a) => a.id) }))
		} else {
			dispatch(clearBulkSelection())
		}
	}

	useShortcut(Shortcut.CreateNew, () => openArticleWizard({}))

	return (
		<Stack sx={{ height: '32px' }} direction="row">
			<Checkbox
				checked={!!articles && bulkActionArticles.length > 0}
				indeterminate={
					articles && bulkActionArticles.length > 0 && bulkActionArticles.length < articles.length
				}
				size="small"
				sx={{
					width: 32,
					height: 32,
				}}
				onChange={() => onChange()}
			/>
			<Stack direction="row" justifyContent="space-between" width="100%">
				<Typography variant="h6" marginLeft={1}>
					Articles
				</Typography>
				{bulkActionArticles.length === 0 && (
					<Button variant="contained" startIcon={<Add />} onClick={() => openArticleWizard({})}>
						Create article
					</Button>
				)}
				{bulkActionArticles.length > 0 && (
					<Button
						color="error"
						variant="outlined"
						sx={{ minWidth: 64 }}
						startIcon={<Delete />}
						onClick={() => openDeleteArticleModal({ articles: bulkActionArticles })}
					>
						Delete
					</Button>
				)}
			</Stack>
		</Stack>
	)
}
