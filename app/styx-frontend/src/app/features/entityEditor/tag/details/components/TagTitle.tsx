import Stack from '@mui/material/Stack'
import useEvent from 'react-use-event-hook'

import { ColorIconPicker } from '@/app/components/ColorIconPicker/ColorIconPicker'
import { EditableTitle } from '@/ui-lib/components/EditableTitle/EditableTitle'

import { TagDraft } from '../draft/useTagDraft'

type Props = {
	draft: TagDraft
	titleProps?: Partial<Parameters<typeof EditableTitle>[0]>
}

export const TagTitle = ({ draft, titleProps }: Props) => {
	const onSave = useEvent((name: string) => {
		draft.setName(name.trim())
	})

	return (
		<EditableTitle
			data-testid="TagTitle"
			value={draft.name}
			displayValue={draft.name || '<Name>'}
			onSave={onSave}
			placeholder="Tag name"
			{...titleProps}
			startAdornment={
				<Stack sx={{ height: 1 }} direction="row">
					{titleProps?.startAdornment}
					<ColorIconPicker
						icon="default"
						defaultIcon="mdi:tag-outline"
						color={'#9f2261'}
						onClick={() => {}}
					/>
				</Stack>
			}
		/>
	)
}
