import { ActorDetails } from '@/api/types/worldTypes'
import { ActorAvatar } from '@/app/components/ActorAvatar/ActorAvatar'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'

type Props = {
	actor: ActorDetails
	highlighted: boolean
}

export function ArticleListItemActorIcon({ actor, highlighted }: Props) {
	const theme = useCustomTheme()

	const highlightBackground =
		theme.mode === 'dark' ? theme.material.palette.primary.dark : theme.material.palette.primary.main
	const background = highlighted ? highlightBackground : theme.material.palette.background.paper

	return (
		<ActorAvatar actor={actor} surroundingColor={background} sx={{ height: 24, width: 24 }} fontSize={12} />
	)
}
