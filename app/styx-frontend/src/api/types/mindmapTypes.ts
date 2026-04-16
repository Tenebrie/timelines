import { GetMindmapApiResponse } from '@api/mindmapApi'

export type MindmapNode = GetMindmapApiResponse['nodes'][number]
export type MindmapWire = GetMindmapApiResponse['links'][number]
