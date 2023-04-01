import { RootState } from '../../store'

export const getWorldState = (state: RootState) => state.world
export const getEventWizardState = (state: RootState) => state.world.eventWizard
