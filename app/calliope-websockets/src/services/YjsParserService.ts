import { Cheerio, load } from 'cheerio'
import { Element, Text } from 'domhandler'
import * as Y from 'yjs'

/**
 * Map HTML tags to Tiptap semantic node names
 * NOTE: These must match Tiptap schema node names EXACTLY (camelCase)
 */
const HTML_TO_SEMANTIC: Record<string, string> = {
	p: 'paragraph',
	h1: 'heading',
	h2: 'heading',
	h3: 'heading',
	h4: 'heading',
	h5: 'heading',
	h6: 'heading',
	ul: 'bulletList',
	ol: 'orderedList',
	li: 'listItem',
	blockquote: 'blockquote',
	pre: 'codeBlock',
	code: 'code',
	br: 'hardBreak',
	hr: 'horizontalRule',
	img: 'image',
	// Inline formatting - these are MARKS in Tiptap, applied to XmlText
	b: 'bold',
	strong: 'bold',
	em: 'italic',
	i: 'italic',
	u: 'underline',
	strike: 'strike',
	s: 'strike',
}

/**
 * Map Tiptap semantic node names to HTML tags
 * NOTE: These must match Tiptap schema node names EXACTLY (camelCase)
 */
const SEMANTIC_TO_HTML: Record<string, string> = {
	paragraph: 'p',
	heading: 'h1', // Default, will be adjusted based on level attribute
	bulletList: 'ul',
	orderedList: 'ol',
	listItem: 'li',
	blockquote: 'blockquote',
	codeBlock: 'pre',
	code: 'code',
	hardBreak: 'br',
	horizontalRule: 'hr',
	image: 'img',
	bold: 'b',
	italic: 'em',
	underline: 'u',
	strike: 'strike',
	// Custom nodes
	mentionChip: 'span',
	externalImageNode: 'img',
}

/**
 * Text marks that should be wrapped in HTML elements
 */
const MARK_TO_HTML: Record<string, string> = {
	bold: 'b',
	italic: 'em',
	underline: 'u',
	strike: 'strike',
	code: 'code',
	link: 'a',
}

function escapeHtmlAttribute(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
}

function escapeHtmlText(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Tags that represent text formatting marks (not nodes)
 */
const MARK_TAGS = new Set(['strong', 'b', 'em', 'i', 'u', 'strike', 's', 'code', 'a'])

/**
 * Map HTML mark tags to Tiptap mark names
 */
const HTML_TAG_TO_MARK: Record<string, string> = {
	strong: 'bold',
	b: 'bold',
	em: 'italic',
	i: 'italic',
	u: 'underline',
	strike: 'strike',
	s: 'strike',
	code: 'code',
	a: 'link',
}

/**
 * Convert HTML to Yjs XmlFragment structure using Tiptap semantic nodes
 * Marks (bold, italic, etc.) are applied as formatting on Y.XmlText nodes
 */
export function htmlToYXml(html: string, parent: Y.XmlFragment | Y.XmlElement) {
	const normalizedHtml = html.trim().startsWith('<') ? html : `<p>${html}</p>`

	const $ = load(normalizedHtml, { xmlMode: false }) // Use HTML mode for proper parsing
	const body = $('body')
	const content = (body.length > 0 ? body : $.root()) as Cheerio<Element>

	/**
	 * Extract text content with marks from an inline element
	 * Returns array of { text, marks, linkAttrs? } objects
	 */
	function extractTextWithMarks(
		node: Element | Text,
		currentMarks: Record<string, boolean | Record<string, string>> = {},
	): Array<{
		text: string
		marks: Record<string, boolean | Record<string, string>>
		element?: Y.XmlElement
	}> {
		const results: Array<{
			text: string
			marks: Record<string, boolean | Record<string, string>>
			element?: Y.XmlElement
		}> = []

		if (node instanceof Text) {
			if (node.data) {
				results.push({ text: node.data, marks: { ...currentMarks } })
			}
		} else if (node instanceof Element) {
			// Check if this is a mention chip
			if (node.name === 'span' && node.attribs?.['data-component-props']) {
				// Create mention element
				const element = new Y.XmlElement('mentionChip')
				if (node.attribs['data-component-props']) {
					try {
						const parsed = JSON.parse(node.attribs['data-component-props'])
						element.setAttribute('componentProps', parsed)
					} catch {
						element.setAttribute('componentProps', node.attribs['data-component-props'])
					}
				}
				if (node.attribs['data-name']) {
					element.setAttribute('name', node.attribs['data-name'])
				}
				if (node.attribs['data-type']) {
					element.setAttribute('type', node.attribs['data-type'])
				}
				results.push({ text: '', marks: {}, element })
			}
			// Check if this is a mark tag (bold, italic, etc.)
			else if (MARK_TAGS.has(node.name)) {
				const markName = HTML_TAG_TO_MARK[node.name]
				const newMarks = { ...currentMarks }

				if (markName === 'link' && node.attribs) {
					// Link mark includes href and other attributes
					const linkAttrs: Record<string, string> = {}
					if (node.attribs.href !== undefined) linkAttrs.href = node.attribs.href
					if (node.attribs.target) linkAttrs.target = node.attribs.target
					if (node.attribs.rel) linkAttrs.rel = node.attribs.rel
					newMarks[markName] = linkAttrs
				} else if (markName) {
					newMarks[markName] = true
				}

				// Process children with the new marks
				for (const child of node.childNodes) {
					results.push(...extractTextWithMarks(child as Element | Text, newMarks))
				}
			}
			// Plain span without data-component-props - just process children
			else if (node.name === 'span') {
				for (const child of node.childNodes) {
					results.push(...extractTextWithMarks(child as Element | Text, currentMarks))
				}
			}
			// Other elements - should not happen in inline context but handle gracefully
			else {
				for (const child of node.childNodes) {
					results.push(...extractTextWithMarks(child as Element | Text, currentMarks))
				}
			}
		}

		return results
	}

	/**
	 * Process inline content and add to parent element
	 * Handles text with marks and mention chips
	 */
	function processInlineContent(node: Element, yParent: Y.XmlElement) {
		for (const child of node.childNodes) {
			const segments = extractTextWithMarks(child as Element | Text)

			for (const segment of segments) {
				if (segment.element) {
					// This is a mention chip or other inline element
					yParent.push([segment.element])
				} else if (segment.text) {
					// This is text with optional marks
					const text = new Y.XmlText()
					text.insert(0, segment.text)

					// Apply marks
					const markKeys = Object.keys(segment.marks)
					if (markKeys.length > 0) {
						const marks: Record<string, boolean | Record<string, string>> = {}
						for (const markName of markKeys) {
							marks[markName] = segment.marks[markName]
						}
						text.format(0, segment.text.length, marks)
					}

					yParent.push([text])
				}
			}
		}
	}

	/**
	 * Process block-level content
	 */
	function processBlock(node: Element, yParent: Y.XmlFragment | Y.XmlElement) {
		// Skip html, head, body wrappers
		if (['html', 'head', 'body'].includes(node.name)) {
			for (const child of node.childNodes) {
				if (child instanceof Element) {
					processBlock(child, yParent)
				}
			}
			return
		}

		const semanticName = HTML_TO_SEMANTIC[node.name] || node.name

		// Handle lists (ul, ol)
		if (node.name === 'ul' || node.name === 'ol') {
			const list = new Y.XmlElement(semanticName)
			yParent.push([list])

			// Process list items
			for (const child of node.childNodes) {
				if (child instanceof Element && child.name === 'li') {
					const listItem = new Y.XmlElement('listItem')
					list.push([listItem])

					// List item content should be wrapped in paragraph
					const para = new Y.XmlElement('paragraph')
					listItem.push([para])

					// Process li children - but handle nested lists specially
					for (const liChild of child.childNodes) {
						if (liChild instanceof Element && (liChild.name === 'ul' || liChild.name === 'ol')) {
							// Nested list goes directly in listItem, not in paragraph
							processBlock(liChild, listItem)
						} else if (liChild instanceof Element || liChild instanceof Text) {
							// Inline content goes in paragraph
							const segments = extractTextWithMarks(liChild as Element | Text)
							for (const segment of segments) {
								if (segment.element) {
									para.push([segment.element])
								} else if (segment.text) {
									const text = new Y.XmlText()
									text.insert(0, segment.text)
									if (Object.keys(segment.marks).length > 0) {
										text.format(0, segment.text.length, segment.marks)
									}
									para.push([text])
								}
							}
						}
					}
				}
			}
		}
		// Handle headings
		else if (node.name.match(/^h[1-6]$/)) {
			const heading = new Y.XmlElement('heading')
			heading.setAttribute('level', node.name[1])
			yParent.push([heading])
			processInlineContent(node, heading)
		}
		// Handle paragraphs
		else if (node.name === 'p') {
			const para = new Y.XmlElement('paragraph')
			yParent.push([para])
			processInlineContent(node, para)
		}
		// Handle blockquote
		else if (node.name === 'blockquote') {
			const blockquote = new Y.XmlElement('blockquote')
			yParent.push([blockquote])
			// Blockquote can contain paragraphs or other blocks
			for (const child of node.childNodes) {
				if (child instanceof Text && child.data.trim()) {
					// Wrap text in paragraph
					const para = new Y.XmlElement('paragraph')
					blockquote.push([para])
					const text = new Y.XmlText()
					text.insert(0, child.data)
					para.push([text])
				} else if (child instanceof Element) {
					processBlock(child, blockquote)
				}
			}
		}
		// Handle pre/code blocks
		else if (node.name === 'pre') {
			const codeBlock = new Y.XmlElement('codeBlock')
			yParent.push([codeBlock])
			// Get all text content
			const textContent = $(node).text()
			if (textContent) {
				const text = new Y.XmlText()
				text.insert(0, textContent)
				codeBlock.push([text])
			}
		}
		// Handle br
		else if (node.name === 'br') {
			const hardBreak = new Y.XmlElement('hardBreak')
			yParent.push([hardBreak])
		}
		// Handle hr
		else if (node.name === 'hr') {
			const hr = new Y.XmlElement('horizontalRule')
			yParent.push([hr])
		}
		// Handle img
		else if (node.name === 'img') {
			const img = new Y.XmlElement('image')
			if (node.attribs?.src) img.setAttribute('src', node.attribs.src)
			if (node.attribs?.alt) img.setAttribute('alt', node.attribs.alt)
			yParent.push([img])
		}
		// Handle generic div or other containers
		else {
			// Just process children
			for (const child of node.childNodes) {
				if (child instanceof Element) {
					processBlock(child, yParent)
				} else if (child instanceof Text && child.data.trim()) {
					// Wrap loose text in paragraph
					const para = new Y.XmlElement('paragraph')
					yParent.push([para])
					const text = new Y.XmlText()
					text.insert(0, child.data)
					para.push([text])
				}
			}
		}
	}

	content.contents().each((_, elem) => {
		if (elem instanceof Text) {
			const trimmed = elem.data.trim()
			if (trimmed) {
				// Wrap loose text in paragraph
				const para = new Y.XmlElement('paragraph')
				parent.push([para])
				const text = new Y.XmlText()
				text.insert(0, elem.data)
				para.push([text])
			}
		} else if (elem instanceof Element) {
			processBlock(elem, parent)
		}
	})
}

/**
 * Convert Yjs XmlFragment to valid HTML, handling Tiptap semantic nodes
 */
export function yXmlToHtml(fragment: Y.XmlFragment | Y.XmlElement): string {
	let html = ''

	fragment.forEach((item) => {
		if (item instanceof Y.XmlText) {
			// Use toDelta() to get text with formatting attributes
			const delta = item.toDelta()

			for (const op of delta) {
				let text = op.insert as string
				const marks = op.attributes || {}

				// Escape HTML special characters in text content
				text = escapeHtmlText(text)

				// Apply text marks as HTML wrapper elements
				const activeMarks: string[] = []

				// Collect active marks in a defined order (for consistent output)
				const markOrder = ['bold', 'italic', 'underline', 'strike', 'code', 'link']
				for (const markName of markOrder) {
					if (marks[markName] && MARK_TO_HTML[markName]) {
						activeMarks.push(markName)
					}
				}

				// Wrap text in mark elements (from outermost to innermost)
				// Reverse the order so the first mark becomes the outermost wrapper
				for (let i = activeMarks.length - 1; i >= 0; i--) {
					const markName = activeMarks[i]
					const htmlTag = MARK_TO_HTML[markName]
					const markValue = marks[markName]

					// If the mark has attributes (is an object), add them to the HTML tag
					if (typeof markValue === 'object' && markValue !== null) {
						const attrsString = Object.entries(markValue)
							.map(([key, value]) => `${key}="${escapeHtmlAttribute(String(value))}"`)
							.join(' ')
						text = `<${htmlTag} ${attrsString}>${text}</${htmlTag}>`
					} else {
						// Simple boolean mark
						text = `<${htmlTag}>${text}</${htmlTag}>`
					}
				}

				html += text
			}
		} else if (item instanceof Y.XmlElement) {
			const semanticName = item.nodeName
			const htmlTag = SEMANTIC_TO_HTML[semanticName] || semanticName
			const attrs = item.getAttributes()

			// Self-closing tags
			if (htmlTag === 'br' || htmlTag === 'hr') {
				html += `<${htmlTag}>`
			}
			// Image tags
			else if (htmlTag === 'img' || semanticName === 'externalImageNode') {
				const src = attrs.src || ''
				const alt = attrs.alt || ''
				html += `<img src="${escapeHtmlAttribute(src)}" alt="${escapeHtmlAttribute(alt)}">`
			}
			// Mention chip - convert to span with data-component-props
			else if (semanticName === 'mentionChip') {
				const componentProps = attrs.componentProps || { actor: null, event: null, article: null, tag: null }
				// If already a string, use it; otherwise stringify
				const serialized =
					typeof componentProps === 'string' ? componentProps : JSON.stringify(componentProps)
				const escaped = escapeHtmlAttribute(serialized)
				const dataType = attrs.type ? ` data-type="${escapeHtmlAttribute(String(attrs.type))}"` : ''
				const dataName = attrs.name ? ` data-name="${escapeHtmlAttribute(String(attrs.name))}"` : ''
				html += `<span data-component-props="${escaped}"${dataType}${dataName}></span>`
			}
			// Headings - use level attribute
			else if (semanticName === 'heading') {
				const level = attrs.level || 1
				const tag = `h${level}`
				html += `<${tag}>`
				html += yXmlToHtml(item)
				html += `</${tag}>`
			}
			// Regular block/inline elements
			else {
				html += `<${htmlTag}`

				// Add remaining attributes (excluding those we've handled specially)
				for (const [key, value] of Object.entries(attrs)) {
					if (
						key === 'level' ||
						key === 'componentProps' ||
						key === 'src' ||
						key === 'alt' ||
						semanticName === 'mentionChip'
					) {
						continue // Already handled
					}

					const serializedValue =
						typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)
					const escapedValue = escapeHtmlAttribute(serializedValue)
					html += ` ${key}="${escapedValue}"`
				}

				html += '>'
				html += yXmlToHtml(item)
				html += `</${htmlTag}>`
			}
		}
	})

	return html
}
