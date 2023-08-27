import { ListItemText, MenuItem } from '@mui/material'

import { Actor } from '../../types'
import { ActorOption } from './useMapActorsToOptions'

type Props = {
	actors: Actor[]
	selectedActors?: Actor[]
	mentionedActors?: Actor[]
}

export const useAutocompleteActorList = ({ actors, selectedActors, mentionedActors }: Props) => {
	const actorOptions = actors
		.map((actor) => ({
			...actor,
			label: `${actor.name}, ${actor.title}`,
		}))
		.filter(
			(actor) => !mentionedActors || !mentionedActors.some((mentionedActor) => mentionedActor.id === actor.id)
		)
	const mentionedActorOptions = actors
		.map((actor) => ({
			...actor,
			label: `${actor.name}, ${actor.title}`,
		}))
		.filter(
			(actor) => !selectedActors || !selectedActors.some((selectedActor) => selectedActor.id === actor.id)
		)

	const renderOption = (props: any, option: ActorOption) => (
		<MenuItem key={option.id} {...props}>
			<ListItemText primary={option.name} secondary={option.title} />
		</MenuItem>
	)

	return {
		actorOptions,
		mentionedActorOptions,
		renderOption,
	}
}
