import { useCreateWorldShareLinkMutation, useGenerateFreeWorldShareLinkMutation } from '@api/otherApi'
import { CollaboratorAccess } from '@api/types/worldCollaboratorsTypes'
import Add from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import debounce from 'lodash.debounce'
import { useCallback, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { useModal } from '@/app/features/modals/ModalsSlice'
import { Shortcut, useShortcut } from '@/app/hooks/useShortcut/useShortcut'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { useEffectOnce } from '@/app/utils/useEffectOnce'
import { useCollaboratorAccess } from '@/app/views/world/views/settings/hooks/useCollaboratorAccess'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'
import Modal, { ModalFooter, ModalHeader, useModalCleanup } from '@/ui-lib/components/Modal'

function useShareSlug() {
	const [randomSlug, setRandomSlug] = useState('')
	const [preferredSlug, setPreferredSlug] = useState('')
	const [error, setError] = useState<string | null>(null)
	const worldId = useSelector(getWorldIdState)

	const [generateSlug] = useGenerateFreeWorldShareLinkMutation()

	const currentSlug = useMemo(() => {
		return preferredSlug || randomSlug
	}, [preferredSlug, randomSlug])

	const checkSlugAvailability = useCallback(
		async (slug: string) => {
			const result = parseApiResponse(await generateSlug({ worldId, body: { preferredSlug: slug } }))
			if (result.error) {
				return { slug: null, preferredSlugFree: false }
			}
			return result.response
		},
		[generateSlug, worldId],
	)

	const validate = useCallback(
		async (slug: string) => {
			if (!slug) {
				setPreferredSlug('')
				setError(null)
				return
			}

			const slugRegex = /^[a-zA-Z0-9-_]+$/
			if (!slugRegex.test(slug)) {
				setError('Only letters, numbers, hyphens and underscores are allowed')
				return
			}

			if (slug.length < 4 || slug.length > 64) {
				setError('Custom link must be between 4 and 64 characters')
				return
			}

			setError(null)
			const result = await checkSlugAvailability(slug)
			if (result.preferredSlugFree) {
				setPreferredSlug(slug)
			} else {
				setError('This link is already taken')
			}
		},
		[checkSlugAvailability],
	)

	const validateDebounced = useMemo(() => {
		return debounce(validate, 500)
	}, [validate])

	const reset = useCallback(async () => {
		setPreferredSlug('')
		setError(null)
		const newRandomSlug = Math.random().toString(36).slice(2, 10)
		setRandomSlug(newRandomSlug)
		const result = await checkSlugAvailability(newRandomSlug)
		if (!result.preferredSlugFree && result.slug) {
			setRandomSlug(result.slug)
		}
	}, [checkSlugAvailability])

	useEffectOnce(() => {
		reset()
	})

	return { currentSlug, randomSlug, error, validate: validateDebounced, reset }
}

export const ShareWorldModal = () => {
	const [slug, setSlug] = useState('')
	const [label, setLabel] = useState('')
	const [access, setAccess] = useState<CollaboratorAccess>('ReadOnly')
	const [expirationDate, setExpirationDate] = useState<Dayjs | null>(dayjs().add(1, 'month'))

	const { listAllLevels } = useCollaboratorAccess()

	const { isOpen, close } = useModal('shareWorldModal')

	const [createShareLink, { isLoading }] = useCreateWorldShareLinkMutation()
	const worldId = useSelector(getWorldIdState)

	const { currentSlug, randomSlug, error, validate: validateSlug, reset: resetSlug } = useShareSlug()

	const currentLink = useMemo(() => {
		return `${window.location.origin}/share/${currentSlug}`
	}, [currentSlug])

	const currentLabel = useMemo(() => {
		return label || currentSlug
	}, [label, currentSlug])

	useModalCleanup({
		isOpen,
		onCleanup: () => {
			resetSlug()
			setSlug('')
			setLabel('')
			setAccess('ReadOnly')
			setExpirationDate(dayjs().add(7, 'day'))
		},
	})

	const onConfirm = async () => {
		if (!isOpen) {
			return
		}

		await createShareLink({
			worldId,
			body: {
				slug: currentSlug,
				label: currentLabel,
				expiresAt: expirationDate?.toISOString(),
				accessMode: access,
			},
		})
		close()
	}

	const { largeLabel: shortcutLabel } = useShortcut(
		Shortcut.CtrlEnter,
		() => {
			onConfirm()
		},
		isOpen ? 1 : -1,
	)

	return (
		<>
			<Modal visible={isOpen} onClose={close}>
				<ModalHeader>Share world</ModalHeader>
				<Paper variant="outlined" sx={{ p: '12px', paddingRight: '8px', bgcolor: 'background.default' }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography>{currentLink}</Typography>
						<IconButton
							size="small"
							sx={{ margin: -1, marginRight: 0 }}
							onClick={() => {
								resetSlug()
								setSlug('')
							}}
						>
							<RefreshIcon fontSize="small" />
						</IconButton>
					</Stack>
				</Paper>
				<TextField
					label="Share link label (Optional)"
					value={label}
					onChange={(e) => setLabel(e.target.value)}
					fullWidth
					placeholder={currentLabel}
					helperText="Name of the link to help identify it later"
				/>
				<TextField
					label="Custom link (Optional)"
					value={slug}
					onChange={(e) => {
						setSlug(e.target.value)
						validateSlug(e.target.value)
					}}
					placeholder={randomSlug}
					fullWidth
					error={!!error}
					helperText={error}
				/>
				<FormControl fullWidth>
					<InputLabel id="share-access-label">Access</InputLabel>
					<Select
						value={access}
						label="Access"
						labelId="share-access-label"
						aria-label="Collaborator access level"
						onChange={(event) => {
							setAccess(event.target.value as CollaboratorAccess)
						}}
					>
						{listAllLevels().map((option) => (
							<MenuItem key={option} value={option}>
								{option}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<DatePicker
					label="Expiration date"
					value={expirationDate}
					onChange={(newValue) => setExpirationDate(newValue)}
				/>
				<ModalFooter>
					<Tooltip title={shortcutLabel} arrow placement="top">
						<Button
							disabled={!isOpen}
							loading={isLoading}
							variant="contained"
							onClick={onConfirm}
							loadingPosition="start"
							startIcon={<Add />}
						>
							<span>Create link</span>
						</Button>
					</Tooltip>
					<Button variant="outlined" onClick={close}>
						Cancel
					</Button>
				</ModalFooter>
			</Modal>
		</>
	)
}
