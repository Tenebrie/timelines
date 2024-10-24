import { GetWorldCollaboratorsApiResponse } from './rheaApi'

export type CollaboratingUser = GetWorldCollaboratorsApiResponse[number]
export type CollaboratorAccess = CollaboratingUser['access']
