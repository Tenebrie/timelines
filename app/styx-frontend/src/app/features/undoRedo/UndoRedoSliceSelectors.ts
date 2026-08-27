import { RootState } from '@/app/store'

export const getUndoRedoState = (state: RootState) => state.undoRedo
