import { WorldTag } from '@/api/types/worldTypes'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useColorUtils } from '@/app/utils/colors/useColorUtils'
import { EntityIcon } from '@/ui-lib/icons/EntityIcon'

type Props = {
	tag: WorldTag
	highlighted: boolean
}

export function ArticleListItemTagIcon({ tag, highlighted }: Props) {
	const theme = useCustomTheme()
	const { adaptColor } = useColorUtils()

	const highlightBackground =
		theme.mode === 'dark' ? theme.material.palette.primary.dark : theme.material.palette.primary.main
	const background = highlighted ? highlightBackground : theme.material.palette.background.paper

	return <EntityIcon variant="tag" height={24} color={adaptColor(tag.color, background)} />
}
