import Add from '@mui/icons-material/Add'
import Cancel from '@mui/icons-material/Cancel'
import Delete from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useDispatch, useSelector } from 'react-redux'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { getWikiPreferences } from '@/app/features/preferences/PreferencesSliceSelectors'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { useListArticles } from '@/app/views/world/api/useListArticles'
import { useIsReadOnly } from '@/app/views/world/hooks/useIsReadOnly'
import { wikiSlice } from '@/app/views/world/views/wiki/WikiSlice'
import { getWikiState } from '@/app/views/world/views/wiki/WikiSliceSelectors'

export const ArticleListHeader = () => {
	const { data: articles } = useListArticles()
	const { readModeEnabled } = useSelector(getWikiPreferences)
	const { isBulkSelecting, bulkActionArticles } = useSelector(getWikiState)
	const { open: openArticleWizard } = useModal('articleWizard')
	const { open: openDeleteArticleModal } = useModal('deleteArticleModal')

	const { isReadOnly } = useIsReadOnly()

	const { setBulkSelecting, addToBulkSelection, clearBulkSelection } = wikiSlice.actions
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

	const onCancel = () => {
		dispatch(setBulkSelecting(false))
		dispatch(clearBulkSelection())
	}

	useShortcut(Shortcut.CreateNew, () => openArticleWizard({}))

	return (
		<Stack sx={{ height: '32px' }} direction="row">
			{isBulkSelecting && (
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
			)}
			<Stack direction="row" justifyContent="space-between" width="100%">
				<Typography variant="h6" marginLeft={1}>
					Articles
				</Typography>
				{!isBulkSelecting && !isReadOnly && (
					<Button
						variant={readModeEnabled ? 'outlined' : 'contained'}
						startIcon={<Add />}
						onClick={() => openArticleWizard({})}
					>
						Create article
					</Button>
				)}
				{isBulkSelecting && (
					<Stack direction="row" gap={1}>
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
						<Button
							color="secondary"
							variant="outlined"
							sx={{ minWidth: 64 }}
							startIcon={<Cancel />}
							onClick={() => onCancel()}
						>
							Cancel
						</Button>
					</Stack>
				)}
			</Stack>
		</Stack>
	)
}
