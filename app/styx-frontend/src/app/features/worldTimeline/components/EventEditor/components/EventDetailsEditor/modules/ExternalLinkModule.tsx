import { Cancel, Edit, Save } from '@mui/icons-material'
import { Button, Stack, Tooltip, Typography } from '@mui/material'
import TextField from '@mui/material/TextField'
import { useCallback, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { useTimelineBusDispatch } from '@/app/features/worldTimeline/hooks/useTimelineBus'
import { worldSlice } from '@/app/features/worldTimeline/reducer'
import { Shortcut, useShortcut } from '@/hooks/useShortcut'
import { QueryParams } from '@/router/routes/QueryParams'

type Props = {
	externalLink: string
	onChange: (value: string) => void
}

const tryValidateUrl = (url: string) => {
	try {
		new URL(url)
		return true
	} catch {
		// Empty
	}

	try {
		new URL(`http://${url}`)
		return true
	} catch (err) {
		console.warn(err)
	}
	return false
}

export const ExternalLinkModule = ({ externalLink, onChange }: Props) => {
	const [isEditing, setEditing] = useState(false)
	const [internalData, setInternalData] = useState(externalLink)
	const isLocal = useMemo(
		() =>
			externalLink.startsWith(`${window.location.origin}/`) ||
			externalLink.startsWith(`${window.location.host}/`),
		[externalLink],
	)
	const validatedLink = useMemo<{ link: string; state: 'valid' | 'invalid' | 'empty' }>(() => {
		if (externalLink.trim() === '') {
			return {
				link: '',
				state: 'empty',
			}
		}
		const isValid = tryValidateUrl(externalLink)
		if (!isValid) {
			return {
				link: externalLink,
				state: 'invalid',
			}
		}

		const link = (() => {
			if (isLocal) {
				return externalLink.replace(window.location.origin, '').replace(window.location.host, '')
			}
			return externalLink.startsWith('http') ? externalLink : `http://${externalLink.trim()}`
		})()
		return {
			link,
			state: 'valid',
		}
	}, [externalLink, isLocal])

	const onSave = useCallback(() => {
		onChange(internalData)
		setEditing(false)
	}, [internalData, onChange])

	const scrollTimelineTo = useTimelineBusDispatch()
	const { setSelectedTime } = worldSlice.actions
	const dispatch = useDispatch()
	const onNavigation = useCallback(() => {
		if (!isLocal) {
			return
		}
		const link = new URL(externalLink)
		if (link.searchParams.has(QueryParams.SELECTED_TIME)) {
			const selectedTime = parseInt(link.searchParams.get(QueryParams.SELECTED_TIME) ?? '0')
			scrollTimelineTo(selectedTime)
			dispatch(setSelectedTime(selectedTime))
		}
	}, [dispatch, externalLink, isLocal, scrollTimelineTo, setSelectedTime])

	const { largeLabel: shortcutLabel } = useShortcut(
		Shortcut.CtrlEnter,
		() => {
			onSave()
		},
		isEditing ? 1 : -1,
	)

	return (
		<>
			<Stack direction="row" gap={1} width="100%">
				{isEditing && (
					<>
						<TextField
							type="text"
							label="Resource Link"
							placeholder="https://example.link"
							value={internalData}
							onChange={(e) => setInternalData(e.target.value)}
							inputProps={{ maxLength: 2048 }}
							fullWidth
						/>
						<Tooltip title={shortcutLabel} arrow placement="top">
							<Button onClick={() => onSave()}>
								<Save />
							</Button>
						</Tooltip>
						<Button onClick={() => setEditing(false)}>
							<Cancel />
						</Button>
					</>
				)}
				{!isEditing && (
					<>
						<Stack
							sx={{
								overflow: 'hidden',
								width: '100%',
							}}
						>
							<Typography variant="body2">{isLocal ? 'Internal' : 'External'} Resource Link:</Typography>
							{validatedLink.state === 'valid' && (
								<Link
									target={isLocal ? undefined : '_blank'}
									style={{
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										wordBreak: 'break-all',
									}}
									to={validatedLink.link}
									onClick={() => onNavigation()}
								>
									{validatedLink.link}
								</Link>
							)}
							{validatedLink.state === 'invalid' && (
								<Typography color="text.secondary">{validatedLink.link} (Invalid URL)</Typography>
							)}
							{validatedLink.state === 'empty' && (
								<Typography color="text.secondary">No link provided</Typography>
							)}
						</Stack>
						<Button onClick={() => setEditing(true)} sx={{ flexShrink: 0 }}>
							<Edit />
						</Button>
					</>
				)}
			</Stack>
		</>
	)
}
