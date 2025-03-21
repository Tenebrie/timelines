import Button, { ButtonProps } from '@mui/material/Button'
import { MouseEvent, ReactElement, useCallback } from 'react'

import { useCustomTheme } from '../features/theming/hooks/useCustomTheme'
import { useAutosave } from '../utils/autosave/useAutosave'
import { noop } from '../utils/noop'

type Props = ButtonProps & {
	onClick: NonNullable<ButtonProps['onClick']>
	isSaving: boolean
	isError?: boolean
	defaultIcon?: ReactElement
}

export function SaveButton({ onClick, isSaving, isError, defaultIcon, children, ...props }: Props) {
	const theme = useCustomTheme()

	const { icon, color, manualSave, disabled } = useAutosave({
		onSave: noop,
		isSaving,
		isError,
		defaultIcon,
	})

	const onInternalClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			if (disabled) {
				return
			}
			manualSave()
			onClick(event)
		},
		[manualSave, onClick, disabled],
	)

	const disabledStyles = {
		cursor: 'not-allowed',
		transition: 'color 0.2s, background-color 0.2s',
		color: theme.material.palette.action.disabled,
		backgroundColor: theme.material.palette.action.disabledBackground,
		'&:hover': {
			backgroundColor: theme.material.palette.action.disabledBackground,
			boxShadow: 'none',
		},
	}

	return (
		<Button
			variant="contained"
			{...props}
			startIcon={icon}
			onClick={onInternalClick}
			color={color}
			sx={{
				...props.sx,
				...(disabled && disabledStyles),
			}}
		>
			{children}
		</Button>
	)
}
