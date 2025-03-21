import Button, { ButtonProps } from '@mui/material/Button'
import { MouseEvent, ReactElement, useCallback } from 'react'

import { useAutosave } from '../utils/autosave/useAutosave'
import { noop } from '../utils/noop'

type Props = ButtonProps & {
	onClick: NonNullable<ButtonProps['onClick']>
	isSaving: boolean
	isError?: boolean
	defaultIcon?: ReactElement
}

export function SaveButton({ onClick, isSaving, isError, defaultIcon, children, ...props }: Props) {
	const { icon, color, manualSave } = useAutosave({
		onSave: noop,
		isSaving,
		isError,
		defaultIcon,
	})

	const onInternalClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			manualSave()
			onClick(event)
		},
		[manualSave, onClick],
	)

	return (
		<Button
			variant="contained"
			sx={{ minWidth: 100 }}
			startIcon={icon}
			onClick={onInternalClick}
			disabled={isSaving}
			color={color}
			{...props}
		>
			{children}
		</Button>
	)
}
