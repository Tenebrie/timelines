import Stack from '@mui/material/Stack'
import useEvent from 'react-use-event-hook'

import { ActorColorIconPicker } from '@/app/components/ColorIconPicker/ActorColorIconPicker'
import { EditableTitle } from '@/ui-lib/components/EditableTitle/EditableTitle'

import { ActorDraft } from '../draft/useActorDraft'

type Props = {
	draft: ActorDraft
	titleProps?: Partial<Parameters<typeof EditableTitle>[0]>
}

export const ActorTitle = ({ draft, titleProps }: Props) => {
	const value = draft.title ? `${draft.name}, ${draft.title}` : draft.name

	const onSave = useEvent((name: string) => {
		const parts = name.split(',')
		draft.setName(parts[0].trim())
		draft.setTitle((parts[1] ?? '').trim())
	})

	return (
		<EditableTitle
			value={value}
			displayValue={value || '<Name>'}
			onSave={onSave}
			placeholder="Actor name, Actor title"
			{...titleProps}
			startAdornment={
				<Stack sx={{ height: 1 }} direction="row">
					{titleProps?.startAdornment}
					<ActorColorIconPicker draft={draft} />
				</Stack>
			}
		/>
	)
}
