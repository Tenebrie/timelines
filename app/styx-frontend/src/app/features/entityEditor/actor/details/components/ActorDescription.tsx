import { ActorDetails } from '@api/types/worldTypes'
import debounce from 'lodash.debounce'
import { useRef } from 'react'
import { useDispatch } from 'react-redux'

import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { worldSlice } from '@/app/views/world/WorldSlice'

type Props = {
	actor: ActorDetails
	surface?: string
}

export const ActorDescription = ({ actor, surface }: Props) => {
	const { updateActor } = worldSlice.actions
	const dispatch = useDispatch()

	const debouncedUpdate = useRef(
		debounce((actorId: string, plainText: string, richText: string) => {
			dispatch(
				updateActor({
					id: actorId,
					description: plainText,
					descriptionRich: richText,
				}),
			)
		}, 500),
	)

	return (
		<RichTextEditorSummoner
			value={actor.descriptionRich}
			onChange={({ plainText, richText }) => {
				debouncedUpdate.current(actor.id, plainText, richText)
			}}
			autoFocus
			surface={surface}
			collaboration={{
				entityType: 'actor',
				documentId: actor.id,
			}}
		/>
	)
}
