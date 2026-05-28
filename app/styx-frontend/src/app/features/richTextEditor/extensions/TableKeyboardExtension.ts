import { Editor, Extension, findParentNodeClosestToPos } from '@tiptap/core'
import type { Node, ResolvedPos } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'
import { CellSelection, TableMap } from '@tiptap/pm/tables'

type Direction = 'left' | 'right' | 'up' | 'down'
type Rect = { left: number; right: number; top: number; bottom: number }

type TableInfo = {
	tableNode: Node
	tableStart: number
	tableMap: TableMap
}

export const TableKeyboardExtension = Extension.create({
	name: 'tableKeyboard',

	addKeyboardShortcuts() {
		return {
			Backspace: () => {
				const { selection } = this.editor.state
				if (!(selection instanceof CellSelection)) {
					return false
				}
				if (!getTableInfo(selection.$anchorCell)) {
					return false
				}
				if (!allCellsEmpty(selection)) {
					return false
				}
				if (selection.isColSelection()) {
					return this.editor.chain().deleteColumn().run()
				}
				if (selection.isRowSelection()) {
					return this.editor.chain().deleteRow().run()
				}
				return false
			},

			// Collapse multi-cell CellSelection to a text cursor at the appropriate edge.
			// Left/Up → start of top-left cell; Right/Down → end of bottom-right cell.
			ArrowLeft: () => collapseToEdge(this.editor, 'left'),
			ArrowRight: () => collapseToEdge(this.editor, 'right'),
			ArrowUp: () => collapseToEdge(this.editor, 'up'),
			ArrowDown: () => collapseToEdge(this.editor, 'down'),

			// Mod+Arrow: jump to adjacent cell when cursor is already at the cell boundary.
			'Mod-ArrowLeft': () => navigateCell(this.editor, 'left'),
			'Mod-ArrowRight': () => navigateCell(this.editor, 'right'),
			'Mod-ArrowUp': () => navigateCell(this.editor, 'up'),
			'Mod-ArrowDown': () => navigateCell(this.editor, 'down'),

			// Shift+Arrow: extend CellSelection one cell at a time, or start one when crossing a cell
			// boundary from a text selection. Consumes the event at table edges so selection stays intact.
			'Shift-ArrowLeft': () => extendCellSel(this.editor, 'left'),
			'Shift-ArrowRight': () => extendCellSel(this.editor, 'right'),
			'Shift-ArrowUp': () => extendCellSel(this.editor, 'up'),
			'Shift-ArrowDown': () => extendCellSel(this.editor, 'down'),

			// Shift+Mod+Arrow: extend (or create) CellSelection to end of the row or column.
			'Shift-Mod-ArrowLeft': () => extendToEndOfRowOrCol(this.editor, 'left'),
			'Shift-Mod-ArrowRight': () => extendToEndOfRowOrCol(this.editor, 'right'),
			'Shift-Mod-ArrowUp': () => extendToEndOfRowOrCol(this.editor, 'up'),
			'Shift-Mod-ArrowDown': () => extendToEndOfRowOrCol(this.editor, 'down'),
		}
	},
})

function allCellsEmpty(selection: CellSelection): boolean {
	let empty = true
	selection.forEachCell((cell) => {
		if (cell.textContent !== '') {
			empty = false
		}
	})
	return empty
}

function getTableInfo($pos: ResolvedPos): TableInfo | null {
	const tableParent = findParentNodeClosestToPos($pos, (node) => node.type.name === 'table')
	if (!tableParent) {
		return null
	}
	return {
		tableNode: tableParent.node,
		tableStart: tableParent.start,
		tableMap: TableMap.get(tableParent.node),
	}
}

function getCell($pos: ResolvedPos): { pos: number; node: Node } | null {
	const cellParent = findParentNodeClosestToPos(
		$pos,
		(node) => node.type.name === 'tableCell' || node.type.name === 'tableHeader',
	)
	if (!cellParent) {
		return null
	}
	return { pos: cellParent.pos, node: cellParent.node }
}

// Resolve the rect of the cell containing $pos within the given table.
function cellRectAt($pos: ResolvedPos, info: TableInfo): Rect | null {
	const cell = getCell($pos)
	if (!cell) {
		return null
	}
	return info.tableMap.findCell(cell.pos - info.tableStart)
}

function isAtStartOfCell(doc: Node, $pos: ResolvedPos): boolean {
	const cell = getCell($pos)
	if (!cell) {
		return false
	}
	const $cellStart = doc.resolve(cell.pos + 1)
	return $pos.pos === TextSelection.near($cellStart, 1).from
}

function isAtEndOfCell(doc: Node, $pos: ResolvedPos): boolean {
	const cell = getCell($pos)
	if (!cell) {
		return false
	}
	const $cellEnd = doc.resolve(cell.pos + cell.node.nodeSize - 1)
	return $pos.pos === TextSelection.near($cellEnd, -1).from
}

// Resolve a doc position for the cell at (row, col), at its start or end edge.
function resolveCellEdge(
	state: Editor['state'],
	info: TableInfo,
	row: number,
	col: number,
	atEnd: boolean,
): ResolvedPos | null {
	const { tableNode, tableStart, tableMap } = info
	const cellOffset = tableMap.positionAt(row, col, tableNode)
	const cellAbsPos = tableStart + cellOffset
	if (!atEnd) {
		return state.doc.resolve(cellAbsPos + 1)
	}
	const cellNode = tableNode.nodeAt(cellOffset)
	if (!cellNode) {
		return null
	}
	return state.doc.resolve(cellAbsPos + cellNode.nodeSize - 1)
}

// The single-step neighbouring (row, col) from a cell rect, or null if out of bounds.
function stepTarget(
	rect: Rect,
	direction: Direction,
	tableMap: TableMap,
): { row: number; col: number } | null {
	const goingForward = direction === 'right' || direction === 'down'
	if (direction === 'left' || direction === 'right') {
		const col = goingForward ? rect.right : rect.left - 1
		if (col < 0 || col >= tableMap.width) {
			return null
		}
		return { row: rect.top, col }
	}
	const row = goingForward ? rect.bottom : rect.top - 1
	if (row < 0 || row >= tableMap.height) {
		return null
	}
	return { row, col: rect.left }
}

function endOfRowColTarget(
	direction: Direction,
	rect: Rect,
	tableMap: TableMap,
): { row: number; col: number } {
	switch (direction) {
		case 'left':
			return { row: rect.top, col: 0 }
		case 'right':
			return { row: rect.top, col: tableMap.width - 1 }
		case 'up':
			return { row: 0, col: rect.left }
		case 'down':
			return { row: tableMap.height - 1, col: rect.left }
	}
}

function collapseToEdge(editor: Editor, direction: Direction): boolean {
	const { state } = editor
	const { selection } = state
	if (!(selection instanceof CellSelection)) {
		return false
	}

	const info = getTableInfo(selection.$anchorCell)
	if (!info) {
		return false
	}
	const { tableStart, tableMap } = info

	const anchorRect = tableMap.findCell(selection.$anchorCell.pos - tableStart)
	const headRect = tableMap.findCell(selection.$headCell.pos - tableStart)

	const goToEnd = direction === 'right' || direction === 'down'
	const targetRow = goToEnd
		? Math.max(anchorRect.bottom, headRect.bottom) - 1
		: Math.min(anchorRect.top, headRect.top)
	const targetCol = goToEnd
		? Math.max(anchorRect.right, headRect.right) - 1
		: Math.min(anchorRect.left, headRect.left)

	const $target = resolveCellEdge(state, info, targetRow, targetCol, goToEnd)
	if (!$target) {
		return false
	}

	editor.view.dispatch(state.tr.setSelection(TextSelection.near($target, goToEnd ? -1 : 1)))
	return true
}

function extendCellSel(editor: Editor, direction: Direction): boolean {
	const { state } = editor
	const { selection } = state
	const goingForward = direction === 'right' || direction === 'down'

	if (selection instanceof CellSelection) {
		const info = getTableInfo(selection.$anchorCell)
		if (!info) {
			return false
		}
		const headRect = info.tableMap.findCell(selection.$headCell.pos - info.tableStart)
		const target = stepTarget(headRect, direction, info.tableMap)
		if (!target) {
			return true // consume event at table edge
		}

		const $head = state.doc.resolve(
			info.tableStart + info.tableMap.positionAt(target.row, target.col, info.tableNode),
		)
		editor.view.dispatch(state.tr.setSelection(new CellSelection(selection.$anchorCell, $head)))
		return true
	}

	if (!(selection instanceof TextSelection)) {
		return false
	}
	const { $head: $selHead, $anchor: $selAnchor } = selection
	const info = getTableInfo($selHead)
	if (!info) {
		return false
	}

	if (goingForward && !isAtEndOfCell(state.doc, $selHead)) {
		return false
	}
	if (!goingForward && !isAtStartOfCell(state.doc, $selHead)) {
		return false
	}

	const headRect = cellRectAt($selHead, info)
	if (!headRect) {
		return false
	}

	const target = stepTarget(headRect, direction, info.tableMap)
	if (!target) {
		return direction === 'left' || direction === 'right'
	}

	const anchorRect = cellRectAt($selAnchor, info) ?? headRect
	const $anchorCell = state.doc.resolve(
		info.tableStart + info.tableMap.positionAt(anchorRect.top, anchorRect.left, info.tableNode),
	)
	const $headCell = state.doc.resolve(
		info.tableStart + info.tableMap.positionAt(target.row, target.col, info.tableNode),
	)
	editor.view.dispatch(state.tr.setSelection(new CellSelection($anchorCell, $headCell)))
	return true
}

function navigateCell(editor: Editor, direction: Direction): boolean {
	const { state } = editor
	const { selection } = state
	if (!(selection instanceof TextSelection) || !selection.$cursor) {
		return false
	}

	const $cursor = selection.$cursor
	const info = getTableInfo($cursor)
	if (!info) {
		return false
	}

	const cellRect = cellRectAt($cursor, info)
	if (!cellRect) {
		return false
	}

	const goingForward = direction === 'right' || direction === 'down'
	if (goingForward && !isAtEndOfCell(state.doc, $cursor)) {
		return false
	}
	if (!goingForward && !isAtStartOfCell(state.doc, $cursor)) {
		return false
	}

	const target = stepTarget(cellRect, direction, info.tableMap)
	if (!target) {
		return false
	}

	const $target = resolveCellEdge(state, info, target.row, target.col, !goingForward)
	if (!$target) {
		return false
	}

	editor.view.dispatch(state.tr.setSelection(TextSelection.near($target, goingForward ? 1 : -1)))
	return true
}

function extendToEndOfRowOrCol(editor: Editor, direction: Direction): boolean {
	const { state } = editor
	const { selection } = state

	if (selection instanceof CellSelection) {
		const info = getTableInfo(selection.$anchorCell)
		if (!info) {
			return false
		}
		const headRect = info.tableMap.findCell(selection.$headCell.pos - info.tableStart)
		const { row, col } = endOfRowColTarget(direction, headRect, info.tableMap)
		const $head = state.doc.resolve(info.tableStart + info.tableMap.positionAt(row, col, info.tableNode))
		editor.view.dispatch(state.tr.setSelection(new CellSelection(selection.$anchorCell, $head)))
		return true
	}

	const { $from } = selection
	const info = getTableInfo($from)
	if (!info) {
		return false
	}

	const cellRect = cellRectAt($from, info)
	if (!cellRect) {
		return false
	}

	const $anchor = state.doc.resolve(
		info.tableStart + info.tableMap.positionAt(cellRect.top, cellRect.left, info.tableNode),
	)
	const { row, col } = endOfRowColTarget(direction, cellRect, info.tableMap)
	const $head = state.doc.resolve(info.tableStart + info.tableMap.positionAt(row, col, info.tableNode))

	editor.view.dispatch(state.tr.setSelection(new CellSelection($anchor, $head)))
	return true
}
