import { useGetMindmapQuery } from '@api/mindmapApi'
import { MindmapNode, MindmapWire } from '@api/types/mindmapTypes'
import { useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'

import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { BoxedWikiEntity } from '../../wiki/hooks/useBoxedWikiContent'
import { boxActor, boxArticle, boxEvent, boxFolder, boxTag } from '../../wiki/utils/boxEntity'
import { getWikiState } from '../../wiki/WikiSliceSelectors'

export type BoxedMindmapNode = {
	id: string
	node: MindmapNode
	parent: BoxedWikiEntity
}

export type BoxedMindmapWire = MindmapWire & {
	sourceNode: BoxedMindmapNode
	targetNode: BoxedMindmapNode
}

export function useBoxedMindmapContent() {
	const {
		id: worldId,
		actors,
		events,
		tags,
	} = useSelector(
		getWorldState,
		(a, b) => a.id === b.id && a.actors === b.actors && a.events === b.events && a.tags === b.tags,
	)
	const { articles, folders } = useSelector(
		getWikiState,
		(a, b) => a.articles === b.articles && a.folders === b.folders,
	)
	const { data } = useGetMindmapQuery({ worldId }, { skip: !worldId })

	const nodeCache = useRef(new Map<object, BoxedMindmapNode>())
	const wireCache = useRef(new Map<object, BoxedMindmapWire>())

	return useMemo(() => {
		if (!data) {
			return {
				actorsWithNodes: [] as BoxedMindmapNode[],
				nodeLinks: [] as BoxedMindmapWire[],
				existingWires: new Set<string>(),
			}
		}

		const prevNodeCache = nodeCache.current
		const nextNodeCache = new Map<object, BoxedMindmapNode>()

		function stableNode(identity: MindmapNode, make: () => BoxedMindmapNode): BoxedMindmapNode {
			const cached = prevNodeCache.get(identity)
			if (cached) {
				nextNodeCache.set(identity, cached)
				return cached
			}
			const item = make()
			nextNodeCache.set(identity, item)
			return item
		}

		const actorsWithNodes: BoxedMindmapNode[] = []
		const nodeById = new Map<string, BoxedMindmapNode>()

		for (const node of data.nodes) {
			const parent =
				(node.parentActorId &&
					(() => {
						const a = actors.find((a) => a.id === node.parentActorId)
						return a && boxActor(a)
					})()) ??
				(node.parentArticleId &&
					(() => {
						const a = articles.find((a) => a.id === node.parentArticleId)
						return a && boxArticle(a)
					})()) ??
				(node.parentEventId &&
					(() => {
						const e = events.find((e) => e.id === node.parentEventId)
						return e && boxEvent(e)
					})()) ??
				(node.parentFolderId &&
					(() => {
						const f = folders.find((f) => f.id === node.parentFolderId)
						return f && boxFolder(f)
					})()) ??
				(node.parentTagId &&
					(() => {
						const t = tags.find((t) => t.id === node.parentTagId)
						return t && boxTag(t)
					})()) ??
				null

			if (!parent) continue

			const boxed = stableNode(node, () => ({ id: node.id, node, parent }))
			actorsWithNodes.push(boxed)
			nodeById.set(node.id, boxed)
		}

		nodeCache.current = nextNodeCache

		const prevWireCache = wireCache.current
		const nextWireCache = new Map<object, BoxedMindmapWire>()

		const nodeLinks: BoxedMindmapWire[] = []
		const existingWires = new Set<string>()

		for (const wire of data.wires) {
			const sourceNode = nodeById.get(wire.sourceNodeId)
			const targetNode = nodeById.get(wire.targetNodeId)
			if (!sourceNode || !targetNode) continue

			const cached = prevWireCache.get(wire)
			if (cached && cached.sourceNode === sourceNode && cached.targetNode === targetNode) {
				nextWireCache.set(wire, cached)
				nodeLinks.push(cached)
			} else {
				const boxed: BoxedMindmapWire = { ...wire, sourceNode, targetNode }
				nextWireCache.set(wire, boxed)
				nodeLinks.push(boxed)
			}

			existingWires.add(`${sourceNode.id}->${targetNode.id}`)
		}

		wireCache.current = nextWireCache

		return { actorsWithNodes, nodeLinks, existingWires }
	}, [data, actors, articles, events, folders, tags])
}
