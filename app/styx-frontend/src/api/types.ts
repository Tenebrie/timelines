import { GetWorldCollaboratorsApiResponse } from './worldApi'

export type CollaboratingUser = GetWorldCollaboratorsApiResponse[number]
export type CollaboratorAccess = CollaboratingUser['access']
