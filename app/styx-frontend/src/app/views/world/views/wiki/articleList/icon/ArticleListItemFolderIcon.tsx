import { WikiFolder } from '@/api/types/worldWikiTypes'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { useColorUtils } from '@/app/utils/colors/useColorUtils'
import { EntityIcon } from '@/ui-lib/icons/EntityIcon'

type Props = {
	folder: WikiFolder
	highlighted: boolean
}

export function ArticleListItemFolderIcon({ folder, highlighted }: Props) {
	const theme = useCustomTheme()
	const { adaptColor } = useColorUtils()

	const highlightBackground =
		theme.mode === 'dark' ? theme.material.palette.primary.dark : theme.material.palette.primary.main
	const background = highlighted ? highlightBackground : theme.material.palette.background.paper

	return <EntityIcon variant="folder" height={24} color={adaptColor(folder.color, background)} />
}
