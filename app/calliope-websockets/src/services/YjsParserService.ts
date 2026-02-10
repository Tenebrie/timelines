import { Cheerio, load } from 'cheerio'
import { Element, Text } from 'domhandler'
import * as Y from 'yjs'

/**
 * Map HTML tags to Tiptap semantic node names
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
}

/**
 * Map Tiptap semantic node names to HTML tags
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
	// Custom nodes
	mentionChip: 'span',
	externalImageNode: 'img',
}

/**
 * Text marks that should be wrapped in HTML elements
 */
const MARK_TO_HTML: Record<string, string> = {
	bold: 'strong',
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
 * Convert HTML to Yjs XmlFragment structure using Tiptap semantic nodes
 */
export function htmlToYXml(html: string, parent: Y.XmlFragment | Y.XmlElement) {
	const normalizedHtml = html.trim().startsWith('<') ? html : `<p>${html}</p>`

	const $ = load(normalizedHtml, { xmlMode: false }) // Use HTML mode for proper parsing
	const body = $('body')
	const content = (body.length > 0 ? body : $.root()) as Cheerio<Element>

	function processNode(node: Element, yParent: Y.XmlFragment | Y.XmlElement) {
		node.childNodes.forEach((child) => {
			if (child instanceof Text) {
				const text = new Y.XmlText()
				text.insert(0, child.data)
				yParent.push([text])
			} else if (child instanceof Element) {
				// Skip html, head, body wrappers
				if (['html', 'head', 'body'].includes(child.name)) {
					if (child.childNodes && child.childNodes.length > 0) {
						processNode(child, yParent)
					}
					return
				}

				// Check if this is a mark element (inline formatting)
				const isMarkElement = ['strong', 'em', 'u', 'strike', 'code', 'a'].includes(child.name)

				if (isMarkElement) {
					// This is a text mark - extract text and apply marks
					extractMarkedText(child, yParent)
				} else {
					// Check if this is a mention chip (span with data-component-props)
					const isMentionChip = child.name === 'span' && child.attribs?.['data-component-props']
					const semanticName = isMentionChip ? 'mentionChip' : HTML_TO_SEMANTIC[child.name] || child.name
					const element = new Y.XmlElement(semanticName)

					// Special handling for heading levels
					if (child.name.match(/^h[1-6]$/)) {
						element.setAttribute('level', child.name[1])
					}

					// Handle special attributes
					if (child.attribs) {
						Object.entries(child.attribs).forEach(([key, value]) => {
							// Special handling for mention chips (custom node)
							if (key === 'data-name') {
								element.setAttribute('name', value)
							}
							if (key === 'data-type') {
								element.setAttribute('type', value)
							}
							if (key === 'data-component-props') {
								try {
									const parsed = JSON.parse(value)
									element.setAttribute('componentProps', parsed)
								} catch (e) {
									console.error('Failed to parse data-component-props:', e)
								}
							}
							// Handle image src/alt
							else if (child.name === 'img') {
								if (key === 'src') {
									element.setAttribute('src', value)
								}
								if (key === 'alt') {
									element.setAttribute('alt', value)
								}
							}
							// Handle link href
							else if (child.name === 'a' && key === 'href') {
								element.setAttribute('href', value)
							}
							// Store other attributes as-is
							else {
								try {
									const parsed = JSON.parse(value)
									element.setAttribute(key, parsed)
								} catch {
									element.setAttribute(key, value)
								}
							}
						})
					}

					// CRITICAL: Add element to parent FIRST (required by Yjs before adding children)
					yParent.push([element])

					// Then process children recursively
					if (child.childNodes && child.childNodes.length > 0) {
						processNode(child, element)
					}
				}
			}
		})
	}

	/**
	 * Extract text from potentially nested mark elements and collect all marks
	 */
	function extractMarkedText(
		node: Element,
		yParent: Y.XmlFragment | Y.XmlElement,
		marks: Record<string, boolean | Record<string, unknown>> = {},
	) {
		// Add current mark to the stack
		const markName = Object.keys(MARK_TO_HTML).find((k) => MARK_TO_HTML[k] === node.name)
		if (markName) {
			// If the element has attributes, store them as an object
			// Otherwise, just set the mark to true
			if (node.attribs && Object.keys(node.attribs).length > 0) {
				// Filter out standard HTML attributes that aren't relevant to the mark
				const relevantAttribs: Record<string, unknown> = {}
				for (const [key, value] of Object.entries(node.attribs)) {
					// Skip class, style, and other purely presentational attributes
					if (!['class', 'style', 'id'].includes(key)) {
						relevantAttribs[key] = value
					}
				}

				// Only store as object if there are relevant attributes
				if (Object.keys(relevantAttribs).length > 0) {
					marks = { ...marks, [markName]: relevantAttribs }
				} else {
					marks = { ...marks, [markName]: true }
				}
			} else {
				marks = { ...marks, [markName]: true }
			}
		}

		node.childNodes.forEach((child) => {
			if (child instanceof Text) {
				if (child.data) {
					// Create text node with all accumulated marks
					const text = new Y.XmlText()
					text.insert(0, child.data)
					// Apply all marks at once
					if (Object.keys(marks).length > 0) {
						text.format(0, child.data.length, marks)
					}
					yParent.push([text])
				}
			} else if (child instanceof Element) {
				// Check if this is another mark element
				const isNestedMark = ['strong', 'em', 'u', 'strike', 'code', 'a'].includes(child.name)
				if (isNestedMark) {
					// Recursively extract text with accumulated marks
					extractMarkedText(child, yParent, marks)
				} else {
					// Non-mark element inside marks - this shouldn't happen in valid Tiptap HTML
					// But handle it gracefully by processing as a regular node
					processNode(child, yParent)
				}
			}
		})
	}

	content.contents().each((_, elem) => {
		if (elem instanceof Text) {
			const trimmed = elem.data.trim()
			if (trimmed) {
				const text = new Y.XmlText()
				text.insert(0, elem.data)
				parent.push([text])
			}
		} else if (elem instanceof Element) {
			// Skip html, head, body wrappers
			if (['html', 'head', 'body'].includes(elem.name)) {
				if (elem.childNodes && elem.childNodes.length > 0) {
					processNode(elem, parent)
				}
				return
			}

			const isMarkElement = ['strong', 'em', 'u', 'strike', 'code', 'a'].includes(elem.name)
			if (isMarkElement) {
				extractMarkedText(elem, parent)
			} else {
				// Check if this is a mention chip (span with data-component-props)
				const isMentionChip = elem.name === 'span' && elem.attribs?.['data-component-props']
				const semanticName = isMentionChip ? 'mentionChip' : HTML_TO_SEMANTIC[elem.name] || elem.name
				const element = new Y.XmlElement(semanticName)

				// Special handling for heading levels
				if (elem.name.match(/^h[1-6]$/)) {
					element.setAttribute('level', elem.name[1])
				}

				if (elem.attribs) {
					Object.entries(elem.attribs).forEach(([key, value]) => {
						// Special handling for mention chips
						if (key === 'data-name') {
							element.setAttribute('name', value)
						} else if (key === 'data-type') {
							element.setAttribute('type', value)
						} else if (key === 'data-component-props') {
							try {
								const parsed = JSON.parse(value)
								element.setAttribute('componentProps', parsed)
							} catch (e) {
								console.error('Failed to parse data-component-props:', e)
							}
						}
						// Handle image src/alt
						else if (elem.name === 'img') {
							if (key === 'src') {
								element.setAttribute('src', value)
							}
							if (key === 'alt') {
								element.setAttribute('alt', value)
							}
						}
						// Store other attributes
						else {
							try {
								const parsed = JSON.parse(value)
								element.setAttribute(key, parsed)
							} catch {
								element.setAttribute(key, value)
							}
						}
					})
				}

				// CRITICAL: Add element to parent FIRST (required by Yjs before adding children)
				parent.push([element])

				// Then process children
				if (elem.childNodes && elem.childNodes.length > 0) {
					processNode(elem, element)
				}
			}
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
