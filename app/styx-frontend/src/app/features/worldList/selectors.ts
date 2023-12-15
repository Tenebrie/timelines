import { RootState } from '../../store'

export const getWorldWizardModalState = (state: RootState) => state.worldList.worldWizardModal
export const getShareWorldModalState = (state: RootState) => state.worldList.shareWorldModal
export const getDeleteWorldModalState = (state: RootState) => state.worldList.deleteWorldModal
