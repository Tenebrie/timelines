import { RootState } from '../../store'

export const getWorldState = (state: RootState) => state.world
export const getEventWizardState = (state: RootState) => state.world.eventWizard
export const getEventTutorialModalState = (state: RootState) => state.world.outliner.eventTutorialModal
export const getDeleteEventModalState = (state: RootState) => state.world.eventEditor.deleteEventModal
export const getDeleteStatementModalState = (state: RootState) => state.world.eventEditor.deleteStatementModal
export const getIssuedStatementWizardState = (state: RootState) =>
	state.world.eventEditor.issuedStatementWizard
export const getRevokedStatementWizardState = (state: RootState) =>
	state.world.eventEditor.revokedStatementWizard
export const getTimelineState = (state: RootState) => state.world.timeline
