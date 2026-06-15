import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'

import { useQuickCreateActor } from '@/app/features/richTextEditor/extensions/mentions/api/useQuickCreateActor'
import { useQuickCreateEvent } from '@/app/features/richTextEditor/extensions/mentions/api/useQuickCreateEvent'
import { useQuickCreateTag } from '@/app/features/richTextEditor/extensions/mentions/api/useQuickCreateTag'
import {
	CreatePopoverButton,
	CreatePopoverButtonProps,
} from '@/ui-lib/components/PopoverButton/CreatePopoverButton'
import { EntityIcon } from '@/ui-lib/icons/EntityIcon'

import { useCreateArticle } from '../api/useCreateArticle'
import { useCreateFolder } from '../api/useCreateFolder'
import { useArticleCollapseControls } from './hooks/useArticleCollapseControls'

type Props = Omit<CreatePopoverButtonProps, 'tooltip' | 'popoverBody' | 'onConfirm'> & {
	folderId: string | null
}

export function ArticleListHeaderCreateButton({ folderId, slotProps, ...props }: Props) {
	const [newEntityName, setNewEntityName] = useState('')

	const createActor = useQuickCreateActor()
	const createEvent = useQuickCreateEvent()
	const [createArticle] = useCreateArticle()
	const [createFolder] = useCreateFolder()
	const createTag = useQuickCreateTag()

	const { forceOpen } = useArticleCollapseControls({ id: folderId })

	const types = ['folder', 'article', 'actor', 'event', 'tag'] as const
	type Type = (typeof types)[number]
	const typeLabels: Record<Type, string> = {
		folder: 'Folder',
		article: 'Article',
		actor: 'Actor',
		event: 'Event',
		tag: 'Tag',
	}
	const [selectedType, setSelectedType] = useState<Type>('folder')

	const handleCreate = useCallback(async () => {
		if (selectedType === 'folder') {
			await createFolder({ name: newEntityName, parentFolderId: folderId })
		} else if (selectedType === 'article') {
			await createArticle({ name: newEntityName, parentFolderId: folderId })
		} else if (selectedType === 'actor') {
			await createActor({ query: newEntityName, parentFolderId: folderId })
		} else if (selectedType === 'event') {
			await createEvent({ query: newEntityName, parentFolderId: folderId })
		} else if (selectedType === 'tag') {
			await createTag({ query: newEntityName, parentFolderId: folderId })
		}
		forceOpen()
	}, [
		createActor,
		createArticle,
		createEvent,
		createFolder,
		createTag,
		folderId,
		forceOpen,
		newEntityName,
		selectedType,
	])

	return (
		<CreatePopoverButton
			onEnterKey={async ({ close }) => {
				await handleCreate()
				close()
			}}
			buttonVariant={folderId ? 'icon' : 'contained'}
			{...props}
			slotProps={{
				...slotProps,
				primaryButton: { size: 'small', ...slotProps?.primaryButton },
				popover: {
					sx: { marginTop: '4px' },
					anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
					transformOrigin: { vertical: 'top', horizontal: 'center' },
					...slotProps?.popover,
				},
			}}
			tooltip={folderId ? 'Create in folder' : 'Create new object'}
			disableTooltip
			popoverBody={() => (
				<>
					<Typography variant="subtitle2" fontWeight="bold">
						{folderId ? 'Create in folder' : 'Create new object'}
					</Typography>
					<ButtonGroup>
						{types.map((type) => (
							<Button
								key={type}
								variant={selectedType === type ? 'contained' : 'outlined'}
								onClick={() => setSelectedType(type)}
								startIcon={<EntityIcon variant={type} />}
								color="secondary"
							>
								{typeLabels[type]}
							</Button>
						))}
					</ButtonGroup>
					<TextField
						size="small"
						placeholder="Name"
						value={newEntityName}
						onChange={(e) => setNewEntityName(e.target.value)}
						fullWidth
					/>
				</>
			)}
			onConfirm={handleCreate}
			onCleanup={() => setNewEntityName('')}
		/>
	)
}
