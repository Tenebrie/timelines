import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { memo, ReactNode } from 'react'

import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { Shortcut } from '@/app/hooks/useShortcut/useShortcutManager'

type Props = {
	label: ReactNode
	hotkey?: (typeof Shortcut)[keyof typeof Shortcut]
	width: number
	visible: boolean
	onClick: () => void
}

export const ResizeableDrawerPulldown = memo(ResizeableDrawerPulldownComponent)

function ResizeableDrawerPulldownComponent({ label, hotkey, width, visible, onClick }: Props) {
	const theme = useCustomTheme()
	return (
		<Stack direction="row" justifyContent="flex-end" sx={{ pointerEvents: 'none' }}>
			<Button
				data-testid="ResizeableDrawerPulldown"
				color="secondary"
				sx={{
					pointerEvents: visible ? 'auto' : 'none',
					minWidth: width,
					maxWidth: '100px',
					background: theme.mode === 'dark' ? 'rgba(0, 0, 0, 40%)' : 'rgba(0, 0, 0, 15%)',
					borderRadius: '0 0 16px 16px',
					'&:hover': {
						background: theme.mode === 'dark' ? 'rgba(0, 0, 0, 60%)' : 'rgba(0, 0, 0, 25%)',
					},
				}}
				onClick={onClick}
			>
				{label}
				{hotkey && (
					<span style={{ color: theme.material.palette.primary.main }}>&nbsp;({hotkey.toUpperCase()})</span>
				)}
			</Button>
		</Stack>
	)
}
