import { WorldEvent } from '@/api/types/worldTypes'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useColorUtils } from '@/app/utils/colors/useColorUtils'
import { CustomEntityIcon } from '@/ui-lib/icons/CustomEntityIcon'

type Props = {
	event: WorldEvent
	highlighted: boolean
}

export function ArticleListItemEventIcon({ event, highlighted }: Props) {
	const theme = useCustomTheme()
	const { adaptColor } = useColorUtils()

	const highlightBackground =
		theme.mode === 'dark' ? theme.material.palette.primary.dark : theme.material.palette.primary.main
	const background = highlighted ? highlightBackground : theme.material.palette.background.paper

	return <CustomEntityIcon height={24} icon={event.icon} color={adaptColor(event.color, background)} />
}
