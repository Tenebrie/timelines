import { useCreateWorldMutation } from '@api/worldListApi'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useState } from 'react'

import { CalendarSelector } from '@/app/features/time/calendar/components/CalendarSelector'
import { isEntityNameValid } from '@/app/utils/isEntityNameValid'
import { parseApiResponse } from '@/app/utils/parseApiResponse'
import { CreatePopoverButton } from '@/ui-lib/components/PopoverButton/CreatePopoverButton'

export function WorldListCreateNewButton() {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [calendars, setCalendars] = useState<string[]>(['earth_current'])

	const [error, setError] = useState<string | null>(null)

	const [createWorld, { isLoading: isCreating }] = useCreateWorldMutation()

	useEffect(() => {
		setError(null)
	}, [name])

	const handleCreateWorld = useCallback(async () => {
		if (!name.trim()) {
			return false
		}

		const validationResult = isEntityNameValid(name)
		if (validationResult.error) {
			setError(validationResult.error)
			return false
		}

		const { error } = parseApiResponse(
			await createWorld({
				body: { name: name.trim(), description: description.trim(), calendars },
			}),
		)
		if (error) {
			setError(error.message)
			return false
		}

		setName('')
		setDescription('')
		setCalendars(['earth_current'])
	}, [name, description, createWorld, calendars])

	return (
		<CreatePopoverButton
			tooltip="Create new world"
			onConfirm={handleCreateWorld}
			confirmDisabled={!name.trim() || isCreating}
			popoverSx={{
				minWidth: 300,
			}}
			popoverBody={({ close }) => (
				<>
					<Typography variant="subtitle2" fontWeight="bold">
						New World
					</Typography>
					<TextField
						label="Name"
						size="small"
						value={name}
						onChange={(e) => setName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key !== 'Enter') {
								return
							}
							handleCreateWorld()
							close()
						}}
						autoFocus
						fullWidth
						disabled={isCreating}
						error={!!error}
						helperText={error}
					/>
					<TextField
						label="Description"
						size="small"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						onKeyDown={(e) => {
							if (e.key !== 'Enter') {
								return
							}
							handleCreateWorld()
							close()
						}}
						fullWidth
						disabled={isCreating}
					/>
					<CalendarSelector value={calendars[0]} onChange={(value) => setCalendars([value])} />
				</>
			)}
		/>
	)
}
