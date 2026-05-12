import { Fragment, Node, Slice } from '@tiptap/pm/model'

export function mapProseMirrorSlice(slice: Slice, fn: (node: Node, offset: number) => Node | null): Slice {
	function walk(fragment: Fragment, base: number): Fragment {
		const out: Node[] = []
		fragment.forEach((node, localOffset) => {
			const absoluteOffset = base + localOffset
			const replaced = fn(node, absoluteOffset)
			if (replaced) out.push(replaced)
			else if (node.content.size) out.push(node.copy(walk(node.content, absoluteOffset + 1)))
			else out.push(node)
		})
		return Fragment.fromArray(out)
	}
	return new Slice(walk(slice.content, 0), slice.openStart, slice.openEnd)
}
