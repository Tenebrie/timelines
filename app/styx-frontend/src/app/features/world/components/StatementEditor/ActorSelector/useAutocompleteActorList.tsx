import { ListItemText, MenuItem } from '@mui/material'

import { Actor } from '../../../types'

type Props = {
	actors: Actor[]
}

export const useAutocompleteActorList = ({ actors }: Props) => {
	const actorOptions = actors.map((actor) => ({
		...actor,
		label: `${actor.name}, ${actor.title}`,
	}))

	const mapPreselectedActors = (targetActors: Actor[]) =>
		targetActors.map((actor) => ({
			...actor,
			label: `${actor.name}, ${actor.title}`,
		}))

	const renderOption = (props: any, option: Actor) => (
		<MenuItem key={option.id} {...props}>
			<ListItemText primary={option.name} secondary={option.title} />
		</MenuItem>
	)

	return {
		actorOptions,
		renderOption,
		mapPreselectedActors,
	}
}
