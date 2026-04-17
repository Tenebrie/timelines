import { GetMindmapApiResponse } from '@api/mindmapApi'

export type MindmapNode = GetMindmapApiResponse['nodes'][number]
export type MindmapWire = GetMindmapApiResponse['wires'][number]
export type MindmapWireDirection = MindmapWire['direction']
