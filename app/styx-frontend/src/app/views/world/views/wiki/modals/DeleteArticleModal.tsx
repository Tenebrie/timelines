import Delete from '@mui/icons-material/Delete'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'

import { useModal } from '@/app/features/modals/reducer'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { useListArticles } from '@/app/views/world/api/useListArticles'
import { useDeleteArticles } from '@/app/views/world/views/wiki/api/useDeleteArticles'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

export const DeleteArticleModal = () => {
	const [deleteArticles, { isLoading }] = useDeleteArticles()
	const [deletionError, setDeletionError] = useState<string | null>(null)

	const { data: baseArticles } = useListArticles()

	const { isOpen, close, articles } = useModal('deleteArticleModal')

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			setDeletionError(null)
		},
	})

	const onConfirm = async () => {
		const { error } = await deleteArticles(articles)
		if (error) {
			setDeletionError(error.message)
			return
		}

		close()
	}

	const onCloseAttempt = () => {
		if (!isLoading) {
			close()
		}
	}

	const { largeLabel: shortcutLabel } = useShortcut([Shortcut.Enter, Shortcut.CtrlEnter], onConfirm, isOpen)

	return (
		<Modal visible={isOpen} onClose={onCloseAttempt}>
			<ModalHeader>Delete article</ModalHeader>
			<Stack spacing={2}>
				{articles.length === 1 && (
					<div>
						Attempting to permanently delete article '
						<b>{baseArticles?.find((a) => a.id === articles[0])?.name}</b>'. This will also delete all related
						data.
					</div>
				)}
				{articles.length > 1 && (
					<div>
						Attempting to permanently delete '<b>{articles.length} articles</b>'. This will also delete all
						related data.
					</div>
				)}
				<div>This action can't be reverted!</div>
				{deletionError && (
					<div style={{ color: 'red' }}>
						Unable to delete: <b>{deletionError}</b>
					</div>
				)}
			</Stack>
			<ModalFooter>
				<Tooltip title={shortcutLabel} arrow placement="top">
					<span>
						<LoadingButton
							loading={isLoading}
							variant="contained"
							color="error"
							onClick={onConfirm}
							loadingPosition="start"
							startIcon={<Delete />}
						>
							<span>Confirm</span>
						</LoadingButton>
					</span>
				</Tooltip>
				<Button variant="outlined" onClick={onCloseAttempt}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	)
}
