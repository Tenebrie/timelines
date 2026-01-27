import { useSelector } from 'react-redux'

import { RichTextEditorSummoner } from '@/app/features/richTextEditor/portals/RichTextEditorPortal'
import { useCustomTheme } from '@/app/features/theming/hooks/useCustomTheme'
import { getWorldIdState } from '@/app/views/world/WorldSliceSelectors'

import { ActorDraft } from '../draft/useActorDraft'

type Props = {
	id?: string
	draft: ActorDraft
}

export const ActorDescription = ({ id, draft }: Props) => {
	const { key } = draft
	const worldId = useSelector(getWorldIdState)
	const theme = useCustomTheme()

	return (
		<RichTextEditorSummoner
			softKey={`${id ?? 'no-key'}/${key}`}
			value={''}
			onChange={() => {}}
			fadeInOverlayColor={theme.custom.palette.background.textEditor}
			collaboration={{
				worldId,
				entityType: 'actor',
				documentId: id ?? '',
			}}
		/>
	)
}
