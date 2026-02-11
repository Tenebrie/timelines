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
