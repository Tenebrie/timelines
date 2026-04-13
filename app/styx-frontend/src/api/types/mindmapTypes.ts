import { GetMindmapApiResponse } from '@api/mindmapApi'

export type MindmapNode = GetMindmapApiResponse['nodes'][number]
export type MindmapLink = GetMindmapApiResponse['links'][number]
