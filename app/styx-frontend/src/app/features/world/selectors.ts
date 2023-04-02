import { RootState } from '../../store'

export const getWorldState = (state: RootState) => state.world
export const getEventWizardState = (state: RootState) => state.world.eventWizard
export const getDeleteEventModalState = (state: RootState) => state.world.eventEditor.deleteEventModal
export const getDeleteStatementModalState = (state: RootState) => state.world.eventEditor.deleteStatementModal
export const getIssuedStatementWizardState = (state: RootState) =>
	state.world.eventEditor.issuedStatementWizard
export const getRevokedStatementWizardState = (state: RootState) =>
	state.world.eventEditor.revokedStatementWizard
