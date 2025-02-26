import { useCustomTheme } from '../../features/theming/useCustomTheme'
import { hashCode } from '../hashCode'

export const useStringColor = (value: string) => {
	const theme = useCustomTheme()
	const hash = Math.abs(hashCode(value))
	const hue = (hash % 20) * 18
	const lightness = theme.mode === 'dark' ? '65%' : '35%'
	return `hsl(${hue},80%,${lightness})`
}
