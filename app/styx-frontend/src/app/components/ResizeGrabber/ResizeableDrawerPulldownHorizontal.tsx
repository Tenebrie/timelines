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

export const ResizeableDrawerPulldownHorizontal = memo(ResizeableDrawerPulldownHorizontalComponent)

function ResizeableDrawerPulldownHorizontalComponent({ label, hotkey, width, visible, onClick }: Props) {
	const theme = useCustomTheme()
	return (
		<Stack direction="row" justifyContent="flex-end" sx={{ pointerEvents: 'none', display: 'flex' }}>
			<Button
				data-testid="ResizeableDrawerPulldown"
				color="secondary"
				sx={{
					pointerEvents: visible ? 'auto' : 'none',
					position: 'absolute',
					marginTop: '16px',
					width: '32px',
					minWidth: '32px',
					minHeight: width,
					maxHeight: '100px',
					background: theme.mode === 'dark' ? '#141f23' : 'rgba(0, 0, 0, 15%)',
					borderRadius: '16px 0 0 16px',
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
