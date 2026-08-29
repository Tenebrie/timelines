import { GetArticlesApiResponse, MoveWikiEntityApiResponse } from '@/api/worldWikiApi'
import { GetFoldersApiResponse } from '@/api/worldWikiFolderApi'

export type WikiArticle = GetArticlesApiResponse[number]
export type WikiFolder = GetFoldersApiResponse[number]
export type WikiPositionUpdate = MoveWikiEntityApiResponse['updates'][number]
