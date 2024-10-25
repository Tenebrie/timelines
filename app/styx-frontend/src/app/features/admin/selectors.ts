import { RootState } from '../../store'

export const getAdminState = (state: RootState) => state.admin
export const getDeleteUserModalState = (state: RootState) => state.admin.deleteUserModal
