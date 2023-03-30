import { RootState } from '../../store'

export const getWorldWizardModalState = (state: RootState) => state.worldList.worldWizardModal
export const getDeleteWorldModalState = (state: RootState) => state.worldList.deleteWorldModal
