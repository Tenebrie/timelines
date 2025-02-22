import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import { useCallback } from 'react'

import { WorldEventModule } from '@/app/features/worldTimeline/types'
import { useIsReadOnly } from '@/app/hooks/useIsReadOnly'

import { useEventModules } from '../hooks/useEventModules'
import { EventModulesPopup } from '../modules/EventModulesPopup'
import { useEventFields } from '../useEventFields'

type Props = {
	modules: WorldEventModule[]
	state: ReturnType<typeof useEventFields>['state']
}

export const EventModulesControls = ({ modules, state }: Props) => {
	const { optionCount } = useEventModules()
	const addModulePopupState = usePopupState({ variant: 'popover', popupId: 'modulePopup' })
	const removeModulePopupState = usePopupState({ variant: 'popover', popupId: 'modulePopup' })

	const { isReadOnly } = useIsReadOnly()

	const onAddModule = useCallback(
		(module: WorldEventModule) => {
			state.setModules([...modules, module])
			addModulePopupState.close()
		},
		[addModulePopupState, modules, state],
	)

	const onRemoveModule = useCallback(
		(module: WorldEventModule) => {
			state.setModules(modules.filter((m) => m !== module))
			switch (module) {
				case 'EventIcon':
					state.setIcon('default')
					break
				case 'ExternalLink':
					state.setExternalLink('')
					break
			}
			removeModulePopupState.close()
		},
		[removeModulePopupState, modules, state],
	)

	return (
		<>
			<Stack alignItems="center" justifyContent="center" gap={2}>
				<Stack direction="row" width="100%" gap={2} justifyContent="center">
					<Button
						variant="contained"
						fullWidth
						disabled={modules.length === optionCount || isReadOnly}
						startIcon={<Add />}
						{...bindTrigger(addModulePopupState)}
					>
						Add field
					</Button>
					<Button
						variant="outlined"
						disabled={modules.length === 0 || isReadOnly}
						fullWidth
						startIcon={<Remove />}
						{...bindTrigger(removeModulePopupState)}
					>
						Remove field
					</Button>
				</Stack>
			</Stack>
			<EventModulesPopup
				mode="add"
				popupState={addModulePopupState}
				modules={modules}
				onAdd={onAddModule}
				onRemove={onRemoveModule}
			/>
			<EventModulesPopup
				mode="remove"
				popupState={removeModulePopupState}
				modules={modules}
				onAdd={onAddModule}
				onRemove={onRemoveModule}
			/>
			<Divider />
		</>
	)
}
