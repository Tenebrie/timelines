import { GetWorldCollaboratorsApiResponse } from './worldCollaboratorsApi'

export type CollaboratingUser = GetWorldCollaboratorsApiResponse[number]
export type CollaboratorAccess = CollaboratingUser['access']
