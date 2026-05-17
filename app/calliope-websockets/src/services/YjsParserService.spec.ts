import { describe, expect, it } from 'vitest'
import * as Y from 'yjs'

import { htmlToYXml, yXmlToHtml } from './YjsParserService.js'

describe('YjsParserService - HTML to Yjs conversion', () => {
	it('converts simple paragraph', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p>Hello world</p>', fragment)

		expect(fragment.length).toBe(1)
		const para = fragment.get(0) as Y.XmlElement
		expect(para.nodeName).toBe('paragraph')
		expect(para.length).toBe(1)
		const text = para.get(0) as Y.XmlText
		expect(text.toString()).toBe('Hello world')
	})

	it('converts bold text with marks as attributes', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p>This is <strong>bold</strong> text</p>', fragment)

		const para = fragment.get(0) as Y.XmlElement
		expect(para.nodeName).toBe('paragraph')
		expect(para.length).toBe(3) // "This is ", "bold", " text"

		// First text node: "This is "
		const text1 = para.get(0) as Y.XmlText
		expect(text1.toString()).toBe('This is ')

		// Second text node: "bold" with bold mark
		// Note: Y.XmlText.toString() returns XML representation with marks as tags
		const text2 = para.get(1) as Y.XmlText
		expect(text2.toString()).toBe('<bold>bold</bold>')
		expect(text2.toDelta()).toEqual([{ insert: 'bold', attributes: { bold: true } }])

		// Third text node: " text"
		const text3 = para.get(2) as Y.XmlText
		expect(text3.toString()).toBe(' text')
	})

	it('converts italic text with marks as attributes', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p>This is <em>italic</em> text</p>', fragment)

		const para = fragment.get(0) as Y.XmlElement
		const text2 = para.get(1) as Y.XmlText
		expect(text2.toString()).toBe('<italic>italic</italic>')
		expect(text2.toDelta()).toEqual([{ insert: 'italic', attributes: { italic: true } }])
	})

	it('converts nested marks', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p>This is <strong><em>bold and italic</em></strong> text</p>', fragment)

		const para = fragment.get(0) as Y.XmlElement
		const text2 = para.get(1) as Y.XmlText
		expect(text2.toString()).toBe('<bold><italic>bold and italic</italic></bold>')
		expect(text2.toDelta()).toEqual([{ insert: 'bold and italic', attributes: { bold: true, italic: true } }])
	})

	it('converts headings with level attribute', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<h2>Heading 2</h2>', fragment)

		const heading = fragment.get(0) as Y.XmlElement
		expect(heading.nodeName).toBe('heading')
		expect(heading.getAttribute('level')).toBe('2')
	})

	it('converts links with href attribute', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p>Visit <a href="https://example.com">example</a> site</p>', fragment)

		const para = fragment.get(0) as Y.XmlElement
		const text1 = para.get(0) as Y.XmlText
		const text2 = para.get(1) as Y.XmlText
		const text3 = para.get(2) as Y.XmlText

		expect(text1.toString()).toBe('Visit ')
		// toString() includes the formatting, so check the delta instead
		expect(text2.toDelta()).toEqual([
			{ insert: 'example', attributes: { link: { href: 'https://example.com' } } },
		])
		expect(text3.toString()).toBe(' site')
	})

	it('converts links with multiple attributes', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml(
			'<p>Visit <a href="https://example.com" target="_blank" rel="noopener">example</a></p>',
			fragment,
		)

		const para = fragment.get(0) as Y.XmlElement
		const text2 = para.get(1) as Y.XmlText

		expect(text2.toDelta()).toEqual([
			{
				insert: 'example',
				attributes: { link: { href: 'https://example.com', target: '_blank', rel: 'noopener' } },
			},
		])
	})

	it('filters out presentational attributes from marks', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml(
			'<p><strong class="bold-class" style="font-weight: 900" id="bold-1">bold</strong></p>',
			fragment,
		)

		const para = fragment.get(0) as Y.XmlElement
		const text = para.get(0) as Y.XmlText

		// Should only have the bold mark, no class/style/id attributes
		expect(text.toDelta()).toEqual([{ insert: 'bold', attributes: { bold: true } }])
	})

	it('converts external image node with data attributes', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml(
			'<img data-type="ImageEmbed" data-asset-id="asset-123" data-external-image-props="{&quot;width&quot;:800}">',
			fragment,
		)

		expect(fragment.length).toBe(1)
		const imgNode = fragment.get(0) as Y.XmlElement
		expect(imgNode.nodeName).toBe('externalImageNode')
		expect(imgNode.getAttribute('type')).toBe('ImageEmbed')
		expect(imgNode.getAttribute('assetId')).toBe('asset-123')
		expect(imgNode.getAttribute('externalImageProps')).toEqual({ width: 800 })
	})

	it('handles malformed externalImageProps JSON by storing raw string', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml(
			'<img data-type="ImageEmbed" data-asset-id="asset-123" data-external-image-props="not-valid-json">',
			fragment,
		)

		const imgNode = fragment.get(0) as Y.XmlElement
		expect(imgNode.nodeName).toBe('externalImageNode')
		expect(imgNode.getAttribute('externalImageProps')).toBe('not-valid-json')
	})

	it('converts mention chips with componentProps', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const html =
			'<p>Mention: <span data-component-props="{&quot;actor&quot;:&quot;actor-123&quot;,&quot;event&quot;:false,&quot;article&quot;:false}"></span></p>'
		htmlToYXml(html, fragment)

		const para = fragment.get(0) as Y.XmlElement
		const span = para.get(1) as Y.XmlElement
		expect(span.nodeName).toBe('mentionChip')
		expect(span.getAttribute('componentProps')).toEqual({
			actor: 'actor-123',
			event: false,
			article: false,
		})
	})
})

describe('YjsSyncService - Yjs to HTML conversion', () => {
	it('converts paragraph to HTML', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const para = new Y.XmlElement('paragraph')
		const text = new Y.XmlText()
		text.insert(0, 'Hello world')
		para.push([text])
		fragment.push([para])

		const html = yXmlToHtml(fragment)
		expect(html).toBe('<p>Hello world</p>')
	})

	it('converts text with bold mark to strong tag', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const para = new Y.XmlElement('paragraph')

		const text1 = new Y.XmlText()
		text1.insert(0, 'This is ')

		const text2 = new Y.XmlText()
		text2.insert(0, 'bold')
		text2.format(0, 4, { bold: true })

		const text3 = new Y.XmlText()
		text3.insert(0, ' text')

		para.push([text1])
		para.push([text2])
		para.push([text3])
		fragment.push([para])

		const html = yXmlToHtml(fragment)
		expect(html).toBe('<p>This is <b>bold</b> text</p>')
	})

	it('converts text with italic mark to em tag', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const para = new Y.XmlElement('paragraph')
		const text = new Y.XmlText()
		text.insert(0, 'italic')
		text.format(0, 6, { italic: true })
		para.push([text])
		fragment.push([para])

		const html = yXmlToHtml(fragment)
		expect(html).toBe('<p><em>italic</em></p>')
	})

	it('converts text with nested marks', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const para = new Y.XmlElement('paragraph')
		const text = new Y.XmlText()
		text.insert(0, 'bold and italic')
		text.format(0, 15, { bold: true, italic: true })
		para.push([text])
		fragment.push([para])

		const html = yXmlToHtml(fragment)
		// Should have both tags (order may vary) - now uses <b> instead of <strong>
		expect(html).toMatch(/<p><(b|em)><(b|em)>bold and italic<\/(b|em)><\/(b|em)><\/p>/)
	})

	it('converts heading with level to h tag', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const heading = new Y.XmlElement('heading')
		heading.setAttribute('level', '2')
		const text = new Y.XmlText()
		text.insert(0, 'Heading 2')
		heading.push([text])
		fragment.push([heading])

		const html = yXmlToHtml(fragment)
		expect(html).toBe('<h2>Heading 2</h2>')
	})

	it('converts externalImageNode to img tag with data attributes', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const imgNode = new Y.XmlElement('externalImageNode')
		imgNode.setAttribute('type', 'ImageEmbed')
		imgNode.setAttribute('assetId', 'asset-123')
		// @ts-expect-error - Library type signature is wrong
		imgNode.setAttribute('externalImageProps', { style: 'max-width:100%' })
		fragment.push([imgNode])

		const html = yXmlToHtml(fragment)
		expect(html).toBe(
			'<img data-type="ImageEmbed" data-asset-id="asset-123" data-external-image-props="{&quot;style&quot;:&quot;max-width:100%&quot;}" alt="">',
		)
	})

	it('converts mentionChip to span with data-component-props', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const para = new Y.XmlElement('paragraph')
		const span = new Y.XmlElement('mentionChip')
		// Store as a structured object that will be serialized
		span.setAttribute(
			'componentProps',
			JSON.stringify({
				actor: 'actor-123',
				event: false,
				article: false,
			}),
		)
		para.push([span])
		fragment.push([para])

		const html = yXmlToHtml(fragment)
		expect(html).toBe(
			'<p><span data-component-props="{&quot;actor&quot;:&quot;actor-123&quot;,&quot;event&quot;:false,&quot;article&quot;:false}"></span></p>',
		)
	})
})

describe('YjsSyncService - Round-trip conversion', () => {
	// Helper to test round-trip conversion
	const testRoundTrip = (html: string, expectedHtml?: string) => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('default')

		// Convert HTML to Yjs
		htmlToYXml(html, fragment)

		// Convert back to HTML
		const result = yXmlToHtml(fragment)

		expect(result).toBe(expectedHtml || html)
	}

	it('converts simple paragraph', () => {
		const html = '<p>Hello world</p>'
		testRoundTrip(html)
	})

	it('converts bold text', () => {
		const html = '<p>This is <strong>bold</strong> text</p>'
		const expected = '<p>This is <b>bold</b> text</p>'
		testRoundTrip(html, expected)
	})

	it('converts italic text', () => {
		const html = '<p>This is <em>italic</em> text</p>'
		testRoundTrip(html)
	})

	it('converts underlined text', () => {
		const html = '<p>This is <u>underlined</u> text</p>'
		testRoundTrip(html)
	})

	it('converts nested marks', () => {
		const html = '<p>This is <strong><em>bold and italic</em></strong> text</p>'
		const expected = '<p>This is <b><em>bold and italic</em></b> text</p>'
		testRoundTrip(html, expected)
	})

	it('converts headings with levels', () => {
		const html = '<h2>Heading 2</h2>'
		testRoundTrip(html)
	})

	it('converts multiple headings', () => {
		const html = '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>'
		testRoundTrip(html)
	})

	it('converts bullet lists', () => {
		const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
		const expected = '<ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul>'
		testRoundTrip(html, expected)
	})

	it('converts ordered lists', () => {
		const html = '<ol><li>First</li><li>Second</li></ol>'
		const expected = '<ol><li><p>First</p></li><li><p>Second</p></li></ol>'
		testRoundTrip(html, expected)
	})

	it('converts images', () => {
		const html = '<img src="https://example.com/image.png" alt="Test image">'
		testRoundTrip(html)
	})

	it('converts external image node at block level', () => {
		const input =
			'<img data-type="ImageEmbed" data-asset-id="asset-123" data-external-image-props="{&quot;style&quot;:&quot;max-width:100%&quot;}">'
		// alt is not stored in the Yjs node, so it becomes empty on the way back out
		const expected =
			'<img data-type="ImageEmbed" data-asset-id="asset-123" data-external-image-props="{&quot;style&quot;:&quot;max-width:100%&quot;}" alt="">'
		testRoundTrip(input, expected)
	})

	it('converts external image node inline inside paragraph', () => {
		const input =
			'<p>See: <img data-type="ImageEmbed" data-asset-id="asset-456" data-external-image-props="{&quot;width&quot;:800}"></p>'
		const expected =
			'<p>See: <img data-type="ImageEmbed" data-asset-id="asset-456" data-external-image-props="{&quot;width&quot;:800}" alt=""></p>'
		testRoundTrip(input, expected)
	})

	it('converts mention chips with actor', () => {
		const html =
			'<p>Mention: <span data-component-props="{&quot;actor&quot;:&quot;actor-123&quot;,&quot;event&quot;:false,&quot;article&quot;:false}"></span></p>'
		testRoundTrip(html)
	})

	it('converts mention chips with event', () => {
		const html =
			'<p>Event: <span data-component-props="{&quot;actor&quot;:false,&quot;event&quot;:&quot;event-456&quot;,&quot;article&quot;:false}"></span></p>'
		testRoundTrip(html)
	})

	it('converts mention chips with article', () => {
		const html =
			'<p>Article: <span data-component-props="{&quot;actor&quot;:false,&quot;event&quot;:false,&quot;article&quot;:&quot;article-789&quot;}"></span></p>'
		testRoundTrip(html)
	})

	it('converts complex real-world example', () => {
		const html = `<p>This is an example text</p><p>This is the target to find: <span data-component-props="{&quot;actor&quot;:&quot;d0f1c21a-a584-4153-8408-c0b5f60516c7&quot;,&quot;event&quot;:false,&quot;article&quot;:false}"></span> </p><p>It's called a mention, and we need to parse them.</p><p><span data-component-props="{&quot;actor&quot;:false,&quot;event&quot;:&quot;4942295e-6e25-4b05-9764-5b22b8983c3f&quot;,&quot;article&quot;:false}"></span> </p><p><span data-component-props="{&quot;actor&quot;:false,&quot;event&quot;:false,&quot;article&quot;:&quot;600dff9d-c31c-4c07-addb-37e16f6db7b2&quot;}"></span> </p>`
		testRoundTrip(html)
	})

	it('converts mixed formatting', () => {
		const html = '<p>This is <strong>bold</strong> and <em>italic</em> text.</p>'
		const expected = '<p>This is <b>bold</b> and <em>italic</em> text.</p>'
		testRoundTrip(html, expected)
	})

	it('converts links with href', () => {
		const html = '<p>Visit <a href="https://example.com">example</a> site</p>'
		testRoundTrip(html)
	})

	it('converts links with multiple attributes', () => {
		const html = '<p>Visit <a href="https://example.com" target="_blank" rel="noopener">example</a></p>'
		testRoundTrip(html)
	})

	it('handles empty paragraphs', () => {
		const html = '<p></p>'
		testRoundTrip(html)
	})

	it('handles hard breaks', () => {
		// Hard breaks are stripped by the parser - this is expected
		const html = '<p>Line 1<br>Line 2</p>'
		const expected = '<p>Line 1Line 2</p>'
		testRoundTrip(html, expected)
	})

	it('handles blockquotes', () => {
		// Blockquote content is wrapped in paragraph
		const html = '<blockquote>This is a quote</blockquote>'
		const expected = '<blockquote><p>This is a quote</p></blockquote>'
		testRoundTrip(html, expected)
	})

	it('handles multiple paragraphs', () => {
		const html = '<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>'
		testRoundTrip(html)
	})

	it('handles text with multiple marks', () => {
		const html = '<p><strong><em><u>Triple marked text</u></em></strong></p>'
		const expected = '<p><b><em><u>Triple marked text</u></em></b></p>'
		testRoundTrip(html, expected)
	})

	it('converts strike-through text', () => {
		const html = '<p>This is <strike>crossed out</strike> text</p>'
		testRoundTrip(html)
	})

	it('converts inline code', () => {
		const html = '<p>Use <code>console.info()</code> function</p>'
		testRoundTrip(html)
	})

	it('converts code blocks', () => {
		const html = '<pre>code block content</pre>'
		testRoundTrip(html)
	})

	it('converts horizontal rules', () => {
		const html = '<p>Before</p><hr><p>After</p>'
		testRoundTrip(html)
	})

	it('converts all heading levels', () => {
		const html = '<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>'
		testRoundTrip(html)
	})

	it('converts nested lists', () => {
		const html = '<ul><li>Item 1<ul><li>Nested 1</li><li>Nested 2</li></ul></li><li>Item 2</li></ul>'
		const expected =
			'<ul><li><p>Item 1</p><ul><li><p>Nested 1</p></li><li><p>Nested 2</p></li></ul></li><li><p>Item 2</p></li></ul>'
		testRoundTrip(html, expected)
	})

	it('converts mixed content in list items', () => {
		const html =
			'<ul><li>This is <strong>bold</strong> text in list</li><li>This is <em>italic</em> text</li></ul>'
		const expected =
			'<ul><li><p>This is <b>bold</b> text in list</p></li><li><p>This is <em>italic</em> text</p></li></ul>'
		testRoundTrip(html, expected)
	})

	it('handles special characters in text', () => {
		const html = '<p>Use &lt; and &gt; symbols</p>'
		testRoundTrip(html)
	})

	it('handles quotes and ampersands', () => {
		const html = '<p>Quote: "Hello" &amp; \'World\'</p>'
		testRoundTrip(html)
	})

	it('handles special characters in link href', () => {
		const html = '<p><a href="https://example.com?a=1&amp;b=2">link</a></p>'
		testRoundTrip(html)
	})

	it('handles empty list items', () => {
		const html = '<ul><li></li><li>Item 2</li></ul>'
		const expected = '<ul><li><p></p></li><li><p>Item 2</p></li></ul>'
		testRoundTrip(html, expected)
	})

	it('handles empty marks', () => {
		// Empty marks are removed during processing - this is expected behavior
		const html = '<p>Text with <strong></strong> empty mark</p>'
		const expected = '<p>Text with  empty mark</p>'
		testRoundTrip(html, expected)
	})

	it('handles consecutive marks', () => {
		const html = '<p><strong>bold</strong><em>italic</em></p>'
		const expected = '<p><b>bold</b><em>italic</em></p>'
		testRoundTrip(html, expected)
	})

	it('handles links with empty href', () => {
		const html = '<p><a href="">empty link</a></p>'
		testRoundTrip(html)
	})

	it('handles whitespace preservation', () => {
		const html = '<p>  Multiple   spaces  </p>'
		testRoundTrip(html)
	})

	it('handles strike combined with other marks', () => {
		const html = '<p><strong><strike>Bold and struck</strike></strong></p>'
		const expected = '<p><b><strike>Bold and struck</strike></b></p>'
		testRoundTrip(html, expected)
	})

	it('handles inline code combined with other marks', () => {
		const html = '<p><strong><code>Bold code</code></strong></p>'
		const expected = '<p><b><code>Bold code</code></b></p>'
		testRoundTrip(html, expected)
	})

	it('handles complex real-world conversion', () => {
		const html = `<h2>Immediate Schedule</h2><p><b>Current Date:</b> Tuesday, March 1st (morning)</p><h3>Tuesday, March 1st:</h3><ul><li>Morning: Scene work with <span data-component-props="{&quot;actor&quot;:&quot;9d27a335-22df-4a23-954d-f29bbed50c20&quot;}" data-type="mention" data-name="Mira Okonkwo"></span> (presumably)</li><li>2:00 PM: Mysterious letter meeting (CONFLICT—Ivera has work)</li><li>Ongoing: Media likely to discover studio location</li></ul><h3>This Week:</h3><ul><li>Daily scene work with Mira</li><li>Revised prep, rehearsals, wardrobe pipeline</li><li>March 5-6: Contestants arrive</li></ul><p><b>March 8: Season 4 goes live</b> (7 days away)</p><h3>Outstanding Items:</h3><ul><li>[ ] Mysterious letter meeting—how to handle scheduling conflict?</li><li>[ ] Investigate <span data-component-props="{&quot;article&quot;:&quot;af9e83d9-6232-4f12-8d57-75105e627edd&quot;}" data-type="mention" data-name="Korzeniarze"></span> backup property in Northshore</li><li>[ ] <span data-component-props="{&quot;actor&quot;:&quot;95a44522-81ba-48dd-bba1-de1cc7c2f043&quot;}" data-type="mention" data-name="Char"></span>'s wings—teaching session interrupted, needs completion</li><li>[ ] <span data-component-props="{&quot;actor&quot;:&quot;bff88a82-1542-4eb5-927e-2e9846dc7080&quot;}" data-type="mention" data-name="Seven"></span>'s healing—still sleeping, needs ongoing care</li><li>[ ] <span data-component-props="{&quot;actor&quot;:&quot;2f6dec69-4622-4bc8-b10b-d741603de3bc&quot;}" data-type="mention" data-name="Aveline"></span> locating Rhaena, Zenith, Or'thana</li><li>[ ] Wedding dress still on hold at <span data-component-props="{&quot;actor&quot;:&quot;e827079d-7a96-4b24-aa22-550f0722aaa3&quot;}" data-type="mention" data-name="Belle"></span>'s (expires ~March 11)</li><li>[ ] EPI response—<span data-component-props="{&quot;actor&quot;:&quot;5f0f5210-4602-4b63-bc81-11cbd67bafde&quot;}" data-type="mention" data-name="Director Sarah Chen"></span>'s office reached out for "formal meeting"</li></ul>`
		const expected = `<h2>Immediate Schedule</h2><p><b>Current Date:</b> Tuesday, March 1st (morning)</p><h3>Tuesday, March 1st:</h3><ul><li><p>Morning: Scene work with <span data-component-props="{&quot;actor&quot;:&quot;9d27a335-22df-4a23-954d-f29bbed50c20&quot;}" data-type="mention" data-name="Mira Okonkwo"></span> (presumably)</p></li><li><p>2:00 PM: Mysterious letter meeting (CONFLICT—Ivera has work)</p></li><li><p>Ongoing: Media likely to discover studio location</p></li></ul><h3>This Week:</h3><ul><li><p>Daily scene work with Mira</p></li><li><p>Revised prep, rehearsals, wardrobe pipeline</p></li><li><p>March 5-6: Contestants arrive</p></li></ul><p><b>March 8: Season 4 goes live</b> (7 days away)</p><h3>Outstanding Items:</h3><ul><li><p>[ ] Mysterious letter meeting—how to handle scheduling conflict?</p></li><li><p>[ ] Investigate <span data-component-props="{&quot;article&quot;:&quot;af9e83d9-6232-4f12-8d57-75105e627edd&quot;}" data-type="mention" data-name="Korzeniarze"></span> backup property in Northshore</p></li><li><p>[ ] <span data-component-props="{&quot;actor&quot;:&quot;95a44522-81ba-48dd-bba1-de1cc7c2f043&quot;}" data-type="mention" data-name="Char"></span>'s wings—teaching session interrupted, needs completion</p></li><li><p>[ ] <span data-component-props="{&quot;actor&quot;:&quot;bff88a82-1542-4eb5-927e-2e9846dc7080&quot;}" data-type="mention" data-name="Seven"></span>'s healing—still sleeping, needs ongoing care</p></li><li><p>[ ] <span data-component-props="{&quot;actor&quot;:&quot;2f6dec69-4622-4bc8-b10b-d741603de3bc&quot;}" data-type="mention" data-name="Aveline"></span> locating Rhaena, Zenith, Or'thana</p></li><li><p>[ ] Wedding dress still on hold at <span data-component-props="{&quot;actor&quot;:&quot;e827079d-7a96-4b24-aa22-550f0722aaa3&quot;}" data-type="mention" data-name="Belle"></span>'s (expires ~March 11)</p></li><li><p>[ ] EPI response—<span data-component-props="{&quot;actor&quot;:&quot;5f0f5210-4602-4b63-bc81-11cbd67bafde&quot;}" data-type="mention" data-name="Director Sarah Chen"></span>'s office reached out for "formal meeting"</p></li></ul>`
		testRoundTrip(html, expected)
	})

	it('converts html to xml correctly', () => {
		const html = `<h2>Immediate Schedule</h2><p><b>Current Date:</b> Tuesday, March 1st (morning)</p><h3>Tuesday, March 1st:</h3><ul><li>Morning: Scene work with <span data-component-props="{&quot;actor&quot;:&quot;9d27a335-22df-4a23-954d-f29bbed50c20&quot;}" data-type="mention" data-name="Mira Okonkwo"></span> (presumably)</li><li>2:00 PM: Mysterious letter meeting (CONFLICT—Ivera has work)</li><li>Ongoing: Media likely to discover studio location</li></ul><h3>This Week:</h3><ul><li>Daily scene work with Mira</li><li>Revised prep, rehearsals, wardrobe pipeline</li><li>March 5-6: Contestants arrive</li></ul><p><b>March 8: Season 4 goes live</b> (7 days away)</p><h3>Outstanding Items:</h3><ul><li>[ ] Mysterious letter meeting—how to handle scheduling conflict?</li><li>[ ] Investigate <span data-component-props="{&quot;article&quot;:&quot;af9e83d9-6232-4f12-8d57-75105e627edd&quot;}" data-type="mention" data-name="Korzeniarze"></span> backup property in Northshore</li><li>[ ] <span data-component-props="{&quot;actor&quot;:&quot;95a44522-81ba-48dd-bba1-de1cc7c2f043&quot;}" data-type="mention" data-name="Char"></span>'s wings—teaching session interrupted, needs completion</li><li>[ ] <span data-component-props="{&quot;actor&quot;:&quot;bff88a82-1542-4eb5-927e-2e9846dc7080&quot;}" data-type="mention" data-name="Seven"></span>'s healing—still sleeping, needs ongoing care</li><li>[ ] <span data-component-props="{&quot;actor&quot;:&quot;2f6dec69-4622-4bc8-b10b-d741603de3bc&quot;}" data-type="mention" data-name="Aveline"></span> locating Rhaena, Zenith, Or'thana</li><li>[ ] Wedding dress still on hold at <span data-component-props="{&quot;actor&quot;:&quot;e827079d-7a96-4b24-aa22-550f0722aaa3&quot;}" data-type="mention" data-name="Belle"></span>'s (expires ~March 11)</li><li>[ ] EPI response—<span data-component-props="{&quot;actor&quot;:&quot;5f0f5210-4602-4b63-bc81-11cbd67bafde&quot;}" data-type="mention" data-name="Director Sarah Chen"></span>'s office reached out for "formal meeting"</li></ul>`

		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('default')

		// Convert HTML to Yjs
		htmlToYXml(html, fragment)

		// Verify structure - check key elements have correct camelCase node names
		const heading = fragment.get(0) as Y.XmlElement
		expect(heading.nodeName).toBe('heading')
		expect(heading.getAttribute('level')).toBe('2')

		// Check first bullet list (after h2, p, h3)
		const bulletList = fragment.get(3) as Y.XmlElement
		expect(bulletList.nodeName).toBe('bulletList')

		// Check first list item
		const listItem = bulletList.get(0) as Y.XmlElement
		expect(listItem.nodeName).toBe('listItem')

		// Check paragraph inside list item
		const para = listItem.get(0) as Y.XmlElement
		expect(para.nodeName).toBe('paragraph')

		// Check mention chip inside paragraph
		const mentionChip = para.get(1) as Y.XmlElement
		expect(mentionChip.nodeName).toBe('mentionChip')
		expect(mentionChip.getAttribute('componentProps')).toEqual({
			actor: '9d27a335-22df-4a23-954d-f29bbed50c20',
		})
		expect(mentionChip.getAttribute('name')).toBe('Mira Okonkwo')
		expect(mentionChip.getAttribute('type')).toBe('mention')

		// Check bold text in second paragraph
		const boldPara = fragment.get(1) as Y.XmlElement
		expect(boldPara.nodeName).toBe('paragraph')
		const boldText = boldPara.get(0) as Y.XmlText
		const delta = boldText.toDelta()
		expect(delta[0]).toEqual({ insert: 'Current Date:', attributes: { bold: true } })
	})
})

describe('YjsParserService - External image nodes in list items', () => {
	it('places externalImageNode as listItem sibling of paragraph, NOT inside paragraph', () => {
		// Tiptap produces <li><p></p><img data-external-image-props="..."></li>
		// externalImageNode is group:'block' — ProseMirror drops block nodes placed inside a paragraph
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml(
			'<ul><li><p></p><img data-type="embeddedImage" data-asset-id="asset-1" data-external-image-props="{}"></li></ul>',
			fragment,
		)

		const list = fragment.get(0) as Y.XmlElement
		const listItem = list.get(0) as Y.XmlElement
		expect(listItem.nodeName).toBe('listItem')
		expect(listItem.length).toBe(2) // paragraph + externalImageNode, NOT image nested in paragraph

		const para = listItem.get(0) as Y.XmlElement
		expect(para.nodeName).toBe('paragraph')
		expect(para.length).toBe(0) // image must NOT be inside here

		const img = listItem.get(1) as Y.XmlElement
		expect(img.nodeName).toBe('externalImageNode')
		expect(img.getAttribute('assetId')).toBe('asset-1')
	})

	it('preserves paragraph text and places image as sibling', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml(
			'<ul><li><p>list text</p><img data-type="embeddedImage" data-asset-id="asset-2" data-external-image-props="{}"></li></ul>',
			fragment,
		)

		const listItem = (fragment.get(0) as Y.XmlElement).get(0) as Y.XmlElement
		expect(listItem.length).toBe(2)

		const para = listItem.get(0) as Y.XmlElement
		expect(para.nodeName).toBe('paragraph')
		expect((para.get(0) as Y.XmlText).toString()).toBe('list text')

		expect((listItem.get(1) as Y.XmlElement).nodeName).toBe('externalImageNode')
	})

	it('handles multiple images in one list item', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml(
			'<ul><li><p></p>' +
				'<img data-type="embeddedImage" data-asset-id="img-a" data-external-image-props="{}">' +
				'<img data-type="embeddedImage" data-asset-id="img-b" data-external-image-props="{}">' +
				'</li></ul>',
			fragment,
		)

		const listItem = (fragment.get(0) as Y.XmlElement).get(0) as Y.XmlElement
		expect(listItem.length).toBe(3) // paragraph + 2 images, none inside paragraph

		expect((listItem.get(0) as Y.XmlElement).nodeName).toBe('paragraph')
		const img1 = listItem.get(1) as Y.XmlElement
		expect(img1.nodeName).toBe('externalImageNode')
		expect(img1.getAttribute('assetId')).toBe('img-a')
		const img2 = listItem.get(2) as Y.XmlElement
		expect(img2.nodeName).toBe('externalImageNode')
		expect(img2.getAttribute('assetId')).toBe('img-b')
	})

	it('places image in correct nested list item, not the outer one', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml(
			'<ul><li><p>outer text</p>' +
				'<ul><li><p></p><img data-type="embeddedImage" data-asset-id="nested-img" data-external-image-props="{}"></li></ul>' +
				'</li></ul>',
			fragment,
		)

		const outerListItem = (fragment.get(0) as Y.XmlElement).get(0) as Y.XmlElement
		expect(outerListItem.length).toBe(2) // paragraph + nested bulletList, no image here

		const nestedList = outerListItem.get(1) as Y.XmlElement
		expect(nestedList.nodeName).toBe('bulletList')

		const nestedListItem = nestedList.get(0) as Y.XmlElement
		expect(nestedListItem.length).toBe(2) // paragraph + image

		const img = nestedListItem.get(1) as Y.XmlElement
		expect(img.nodeName).toBe('externalImageNode')
		expect(img.getAttribute('assetId')).toBe('nested-img')
	})

	it('round-trips externalImageNode in listItem without structural loss', () => {
		// Simulate the Yjs document Tiptap/y-prosemirror would create
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const list = new Y.XmlElement('bulletList')
		const listItem = new Y.XmlElement('listItem')
		const para = new Y.XmlElement('paragraph')
		const captionText = new Y.XmlText()
		captionText.insert(0, 'caption')
		para.push([captionText])

		const img = new Y.XmlElement('externalImageNode')
		img.setAttribute('type', 'embeddedImage')
		img.setAttribute('assetId', 'round-trip-asset')
		// @ts-expect-error - Library type signature is wrong
		img.setAttribute('externalImageProps', { sizeX: 400, sizeY: 300 })

		listItem.push([para, img])
		list.push([listItem])
		fragment.push([list])

		const html = yXmlToHtml(fragment)

		const doc2 = new Y.Doc()
		const fragment2 = doc2.getXmlFragment('test')
		htmlToYXml(html, fragment2)

		const listItem2 = (fragment2.get(0) as Y.XmlElement).get(0) as Y.XmlElement
		expect(listItem2.nodeName).toBe('listItem')
		expect(listItem2.length).toBe(2) // NOT 1 (image inside paragraph)

		const para2 = listItem2.get(0) as Y.XmlElement
		expect(para2.nodeName).toBe('paragraph')
		expect((para2.get(0) as Y.XmlText).toString()).toBe('caption')

		const img2 = listItem2.get(1) as Y.XmlElement
		expect(img2.nodeName).toBe('externalImageNode')
		expect(img2.getAttribute('assetId')).toBe('round-trip-asset')
		expect(img2.getAttribute('externalImageProps')).toEqual({ sizeX: 400, sizeY: 300 })
	})

	it('HTML round-trip: list item with image produces identical HTML', () => {
		const html =
			'<ul>' +
			'<li><p>text item</p><img data-type="embeddedImage" data-asset-id="a1" data-external-image-props="{}" alt=""></li>' +
			'<li><p>plain item</p></li>' +
			'</ul>'

		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')
		htmlToYXml(html, fragment)
		expect(yXmlToHtml(fragment)).toBe(html)
	})
})

describe('YjsParserService - textStyle mark: htmlToYXml parsing', () => {
	it('captures color from span style into textStyle mark', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p><span style="color: #ff0000">red text</span></p>', fragment)

		const para = fragment.get(0) as Y.XmlElement
		const text = para.get(0) as Y.XmlText
		expect(text.toDelta()).toEqual([{ insert: 'red text', attributes: { textStyle: { color: '#ff0000' } } }])
	})

	it('captures font-family as camelCase fontFamily', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p><span style="font-family: Arial, sans-serif">arial text</span></p>', fragment)

		const para = fragment.get(0) as Y.XmlElement
		const text = para.get(0) as Y.XmlText
		expect(text.toDelta()).toEqual([
			{ insert: 'arial text', attributes: { textStyle: { fontFamily: 'Arial, sans-serif' } } },
		])
	})

	it('captures both color and font-family from a single span', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p><span style="color: #0000ff; font-family: Georgia">styled</span></p>', fragment)

		const para = fragment.get(0) as Y.XmlElement
		const text = para.get(0) as Y.XmlText
		expect(text.toDelta()).toEqual([
			{ insert: 'styled', attributes: { textStyle: { color: '#0000ff', fontFamily: 'Georgia' } } },
		])
	})

	it('ignores CSS custom properties (--text-color) produced by ThemeAwareTextStyle', () => {
		// ThemeAwareTextStyle emits --text-color alongside color: for dark/light luminance values
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml(
			'<p><span style="color: #000000; --text-color: #000000" data-luminance="dark">dark text</span></p>',
			fragment,
		)

		const para = fragment.get(0) as Y.XmlElement
		const text = para.get(0) as Y.XmlText
		const delta = text.toDelta()
		expect(delta).toEqual([{ insert: 'dark text', attributes: { textStyle: { color: '#000000' } } }])
		// Custom property must not leak into the mark under any camelCase key
		const textStyleKeys = Object.keys(delta[0]?.attributes?.textStyle as object)
		expect(textStyleKeys).toHaveLength(1)
		expect(textStyleKeys[0]).toBe('color')
	})

	it('ignores data-luminance HTML attribute — it is not a CSS property', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p><span style="color: #ffffff" data-luminance="light">light text</span></p>', fragment)

		const text = (fragment.get(0) as Y.XmlElement).get(0) as Y.XmlText
		const textStyle = text.toDelta()[0]?.attributes?.textStyle as Record<string, string>
		expect(textStyle).not.toHaveProperty('dataLuminance')
		expect(textStyle).not.toHaveProperty('luminance')
	})

	it('produces no textStyle mark for a span with no style attribute', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p><span>plain</span></p>', fragment)

		const text = (fragment.get(0) as Y.XmlElement).get(0) as Y.XmlText
		expect(text.toDelta()).toEqual([{ insert: 'plain' }])
	})

	it('produces no textStyle mark when style contains only CSS custom properties', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p><span style="--custom-var: value; --another: 42px">text</span></p>', fragment)

		const text = (fragment.get(0) as Y.XmlElement).get(0) as Y.XmlText
		expect(text.toDelta()).toEqual([{ insert: 'text' }])
	})

	it('merges textStyle from nested spans (outer color + inner font-family)', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml(
			'<p><span style="color: #ff0000"><span style="font-family: Verdana">styled</span></span></p>',
			fragment,
		)

		const text = (fragment.get(0) as Y.XmlElement).get(0) as Y.XmlText
		expect(text.toDelta()).toEqual([
			{ insert: 'styled', attributes: { textStyle: { color: '#ff0000', fontFamily: 'Verdana' } } },
		])
	})

	it('combines textStyle with bold mark when span is inside strong', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p><strong><span style="color: #ff0000">bold red</span></strong></p>', fragment)

		const text = (fragment.get(0) as Y.XmlElement).get(0) as Y.XmlText
		expect(text.toDelta()).toEqual([
			{ insert: 'bold red', attributes: { bold: true, textStyle: { color: '#ff0000' } } },
		])
	})

	it('does not extract style attribute from semantic mark elements like strong', () => {
		// Tiptap always puts textStyle in a <span>, never on <strong>/<em>/etc.
		// Styles on mark elements are intentionally ignored (see "filters out presentational attributes" test)
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		htmlToYXml('<p><strong style="color: red">bold</strong></p>', fragment)

		const text = (fragment.get(0) as Y.XmlElement).get(0) as Y.XmlText
		expect(text.toDelta()).toEqual([{ insert: 'bold', attributes: { bold: true } }])
	})
})

describe('YjsParserService - textStyle mark: yXmlToHtml serialization', () => {
	it('emits span with style for color', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const para = new Y.XmlElement('paragraph')
		const text = new Y.XmlText()
		text.insert(0, 'red text')
		text.format(0, 8, { textStyle: { color: '#ff0000' } })
		para.push([text])
		fragment.push([para])

		expect(yXmlToHtml(fragment)).toBe('<p><span style="color: #ff0000">red text</span></p>')
	})

	it('converts camelCase fontFamily back to CSS kebab-case font-family', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const para = new Y.XmlElement('paragraph')
		const text = new Y.XmlText()
		text.insert(0, 'arial text')
		text.format(0, 10, { textStyle: { fontFamily: 'Arial' } })
		para.push([text])
		fragment.push([para])

		expect(yXmlToHtml(fragment)).toBe('<p><span style="font-family: Arial">arial text</span></p>')
	})

	it('emits both color and font-family in the style attribute', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const para = new Y.XmlElement('paragraph')
		const text = new Y.XmlText()
		text.insert(0, 'styled')
		text.format(0, 6, { textStyle: { color: '#0000ff', fontFamily: 'Georgia' } })
		para.push([text])
		fragment.push([para])

		const html = yXmlToHtml(fragment)
		expect(html).toContain('color: #0000ff')
		expect(html).toContain('font-family: Georgia')
		expect(html).toContain('styled')
	})

	it('emits no span when all textStyle values are null', () => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const para = new Y.XmlElement('paragraph')
		const text = new Y.XmlText()
		text.insert(0, 'plain')
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		text.format(0, 5, { textStyle: { color: null, fontFamily: null } as any })
		para.push([text])
		fragment.push([para])

		expect(yXmlToHtml(fragment)).toBe('<p>plain</p>')
	})

	it('wraps textStyle span inside bold tag (textStyle is innermost wrapper)', () => {
		// markOrder is ['bold', ..., 'textStyle']; reversed loop makes textStyle wrap innermost
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('test')

		const para = new Y.XmlElement('paragraph')
		const text = new Y.XmlText()
		text.insert(0, 'bold red')
		text.format(0, 8, { bold: true, textStyle: { color: '#ff0000' } })
		para.push([text])
		fragment.push([para])

		expect(yXmlToHtml(fragment)).toBe('<p><b><span style="color: #ff0000">bold red</span></b></p>')
	})
})

describe('YjsParserService - textStyle round-trip', () => {
	const testRoundTrip = (html: string, expectedHtml?: string) => {
		const doc = new Y.Doc()
		const fragment = doc.getXmlFragment('default')
		htmlToYXml(html, fragment)
		const result = yXmlToHtml(fragment)
		expect(result).toBe(expectedHtml || html)
	}

	it('preserves text color', () => {
		testRoundTrip('<p><span style="color: #ff0000">red text</span></p>')
	})

	it('preserves font-family', () => {
		testRoundTrip('<p><span style="font-family: Arial">arial text</span></p>')
	})

	it('preserves both color and font-family', () => {
		testRoundTrip('<p><span style="color: #0000ff; font-family: Georgia">styled text</span></p>')
	})

	it('strips CSS custom properties from ThemeAwareTextStyle output', () => {
		// ThemeAwareTextStyle adds --text-color: and data-luminance for extreme luminance colors.
		// Those are rendering hints and must not survive the roundtrip.
		const input =
			'<p><span style="color: #000000; --text-color: #000000" data-luminance="dark">dark</span></p>'
		const expected = '<p><span style="color: #000000">dark</span></p>'
		testRoundTrip(input, expected)
	})

	it('ThemeAwareTextStyle: both color and font-family survive, custom props are dropped', () => {
		const input =
			'<p><span style="color: #ffffff; font-family: Arial; --text-color: #ffffff" data-luminance="light">light</span></p>'
		const expected = '<p><span style="color: #ffffff; font-family: Arial">light</span></p>'
		testRoundTrip(input, expected)
	})

	it('preserves color combined with bold (strong → b on roundtrip)', () => {
		const input = '<p><strong><span style="color: #ff0000">bold red</span></strong></p>'
		const expected = '<p><b><span style="color: #ff0000">bold red</span></b></p>'
		testRoundTrip(input, expected)
	})

	it('preserves color inside a list item paragraph', () => {
		testRoundTrip('<ul><li><p><span style="color: #ff0000">colored item</span></p></li></ul>')
	})

	it('preserves rgb() color values', () => {
		testRoundTrip('<p><span style="color: rgb(255, 0, 0)">rgb red</span></p>')
	})

	it('preserves color on text adjacent to unstyled text', () => {
		testRoundTrip('<p>before <span style="color: #ff0000">colored</span> after</p>')
	})

	it('preserves multiple adjacent spans with different colors', () => {
		testRoundTrip('<p><span style="color: #ff0000">red</span><span style="color: #0000ff">blue</span></p>')
	})
})
