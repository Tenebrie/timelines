import { RootState } from '../../store'

export const getWorldState = (state: RootState) => state.world
export const getWorldOutlinerState = (state: RootState) => state.world.outliner
export const getEventEditorState = (state: RootState) => ({
	...state.world.eventEditor,
	event: state.world.events.find((event) => event.id === state.world.eventEditor.eventId),
})
export const getEventWizardState = (state: RootState) => state.world.eventWizard
