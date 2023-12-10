import { Add, Remove } from '@mui/icons-material'
import { Button, Divider, Stack, Typography } from '@mui/material'
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import React, { useCallback } from 'react'

import { WorldEventModule } from '../../../../../types'
import { useEventFields } from '../useEventFields'
import { EventModulesPopup } from './EventModulesPopup'
import { useEventModules } from './useEventModules'

type Props = {
	modules: WorldEventModule[]
	state: ReturnType<typeof useEventFields>['state']
}

export const EventModulesControls = ({ modules, state }: Props) => {
	const { optionCount } = useEventModules()
	const addModulePopupState = usePopupState({ variant: 'popover', popupId: 'modulePopup' })
	const removeModulePopupState = usePopupState({ variant: 'popover', popupId: 'modulePopup' })

	const onAddModule = useCallback(
		(module: WorldEventModule) => {
			state.setModules([...modules, module])
		},
		[modules, state]
	)

	const onRemoveModule = useCallback(
		(module: WorldEventModule) => {
			state.setModules(modules.filter((m) => m !== module))
			switch (module) {
				case 'RevokedAt':
					state.setRevokedAt(undefined)
					break
				case 'EventIcon':
					state.setIcon('default')
					break
				case 'TargetActors':
					state.setSelectedActors([])
					break
				case 'MentionedActors':
					state.setMentionedActors([])
					break
			}
		},
		[modules, state]
	)

	return (
		<>
			<Stack alignItems="center" justifyContent="center" gap={2}>
				<Stack direction="row" width="100%" gap={2} justifyContent="center">
					<Button
						variant="contained"
						fullWidth
						disabled={modules.length === optionCount}
						startIcon={<Add />}
						{...bindTrigger(addModulePopupState)}
					>
						Add field
					</Button>
					<Button
						variant="outlined"
						disabled={modules.length === 0}
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
			{modules.length === 0 && (
				<Typography variant="body1" textAlign="center">
					Missing some fields? You can add them here!
				</Typography>
			)}
		</>
	)
}
