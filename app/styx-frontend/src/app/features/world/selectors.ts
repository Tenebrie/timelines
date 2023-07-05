import { RootState } from '../../store'

export const getWorldState = (state: RootState) => state.world
export const getEventCreatorState = (state: RootState) => state.world.eventCreator
export const getActorWizardState = (state: RootState) => state.world.actorWizard
export const getEventWizardState = (state: RootState) => state.world.eventWizard
export const getEventTutorialModalState = (state: RootState) => state.world.outliner.eventTutorialModal
export const getDeleteActorModalState = (state: RootState) => state.world.actorEditor.deleteActorModal
export const getDeleteEventModalState = (state: RootState) => state.world.eventEditor.deleteEventModal
export const getRevokedStatementWizardState = (state: RootState) =>
	state.world.eventEditor.revokedStatementWizard
export const getIssuedActorStatementWizardState = (state: RootState) =>
	state.world.eventEditor.issuedActorStatementWizard
export const getTimelineState = (state: RootState) => state.timeline
