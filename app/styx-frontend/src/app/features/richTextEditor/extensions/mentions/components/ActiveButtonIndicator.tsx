import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

type Props = {
	active: boolean
}

export const ActiveButtonIndicator = ({ active }: Props) => {
	const theme = useCustomTheme()

	if (!active) {
		return null
	}

	return (
		<div
			style={{
				position: 'absolute',
				top: 4,
				left: 4,
				width: '6px',
				height: '6px',
				borderRadius: '50%',
				background: theme.material.palette.primary.main,
			}}
		/>
	)
}
