import { useGetMindmapQuery } from '@api/mindmapApi'
import Box from '@mui/material/Box'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { dispatchGlobalEvent } from '@/app/features/eventBus'
import { getWorldState } from '@/app/views/world/WorldSliceSelectors'

import { boxActor, boxArticle, boxEvent, boxFolder, boxTag } from '../wiki/utils/boxEntity'
import { getWikiState } from '../wiki/WikiSliceSelectors'
import { getMindmapState } from './MindmapSliceSelectors'
import { ActorNodePositioner } from './workspace/ActorNodePositioner'
import { MindmapWireLayer } from './workspace/MindmapWireLayer'

export function MindmapContent() {
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

	const actorsWithNodes = useMemo(() => {
		if (!data) {
			return []
		}
		return data.nodes
			.map((node) => {
				const parent = (() => {
					const actor = actors.find((a) => a.id === node.parentActorId)
					if (actor) {
						return boxActor(actor)
					}
					const article = articles.find((a) => a.id === node.parentArticleId)
					if (article) {
						return boxArticle(article)
					}
					const event = events.find((e) => e.id === node.parentEventId)
					if (event) {
						return boxEvent(event)
					}
					const folder = folders.find((f) => f.id === node.parentFolderId)
					if (folder) {
						return boxFolder(folder)
					}
					const tag = tags.find((t) => t.id === node.parentTagId)
					if (tag) {
						return boxTag(tag)
					}
					return null
				})()
				if (!parent) {
					return null
				}
				return {
					id: node.id,
					node,
					parent,
				}
			})
			.filter((node) => node !== null)
			.map((node) => node as NonNullable<typeof node>)
	}, [data, actors, articles, events, folders, tags])

	if (!data) {
		return null
	}

	return (
		<Box sx={{ zIndex: 1 }}>
			<MindmapSelectionBridge />
			<MindmapWireLayer actorsWithNodes={actorsWithNodes} />
			{actorsWithNodes.map((wrapper) => (
				<ActorNodePositioner key={wrapper.id} parent={wrapper.parent} node={wrapper.node} />
			))}
		</Box>
	)
}

function MindmapSelectionBridge() {
	const { selectedNodes, selectedWires } = useSelector(getMindmapState, (a, b) => {
		return a.selectedNodes === b.selectedNodes && a.selectedWires === b.selectedWires
	})

	useEffect(() => {
		dispatchGlobalEvent['mindmap/selection/changed']({
			selectedNodeIds: new Set(selectedNodes.map((n) => n.key)),
			selectedWireIds: new Set(selectedWires),
		})
	}, [selectedNodes, selectedWires])

	return null
}
