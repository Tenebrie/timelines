import { ActorDetails } from '@api/types/worldTypes'
import debounce from 'lodash.debounce'
import { useRef } from 'react'
import { useDispatch } from 'react-redux'

import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { worldSlice } from '@/app/views/world/WorldSlice'

type Props = {
	actor: ActorDetails
}

export const ActorDescription = ({ actor }: Props) => {
	const theme = useCustomTheme()

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
			softKey={actor.id}
			value={actor.descriptionRich}
			onChange={({ plainText, richText }) => {
				debouncedUpdate.current(actor.id, plainText, richText)
			}}
			autoFocus
			fadeInOverlayColor={theme.custom.palette.background.textEditor}
			collaboration={{
				entityType: 'actor',
				documentId: actor.id,
			}}
		/>
	)
}
