import { describe, expect, it } from 'vitest'
import * as Y from 'yjs'

import { htmlToYDoc, yDocToHtml } from './YjsParserService.js'

const roundTrip = (html: string, expected?: string) => {
	const doc = new Y.Doc()
	htmlToYDoc(html, doc)
	expect(yDocToHtml(doc)).toBe(expected ?? html)
}

describe('YjsParserService - block nodes', () => {
	it('round-trips a simple paragraph', () => {
		roundTrip('<p>Hello world</p>')
	})

	it('round-trips multiple paragraphs', () => {
		roundTrip('<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>')
	})

	it('round-trips an empty paragraph', () => {
		roundTrip('<p></p>')
	})

	it('round-trips headings', () => {
		roundTrip('<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>')
	})

	it('round-trips a blockquote', () => {
		roundTrip('<blockquote><p>This is a quote</p></blockquote>')
	})

	it('round-trips a code block', () => {
		roundTrip('<pre><code>code block content</code></pre>')
	})

	it('round-trips a horizontal rule', () => {
		roundTrip('<p>Before</p><hr><p>After</p>')
	})
})

describe('YjsParserService - inline marks', () => {
	it('round-trips bold text', () => {
		roundTrip('<p>This is <strong>bold</strong> text</p>')
	})

	it('round-trips italic text', () => {
		roundTrip('<p>This is <em>italic</em> text</p>')
	})

	it('round-trips underlined text', () => {
		roundTrip('<p>This is <u>underlined</u> text</p>')
	})

	it('round-trips strike-through text', () => {
		roundTrip('<p>This is <s>struck</s> text</p>')
	})

	it('round-trips inline code', () => {
		roundTrip('<p>Use <code>console.info()</code> here</p>')
	})

	it('round-trips nested marks', () => {
		roundTrip('<p>This is <strong><em>bold and italic</em></strong> text</p>')
	})

	it('round-trips triple marks', () => {
		roundTrip('<p><strong><em><u>Triple marked</u></em></strong></p>')
	})

	it('round-trips consecutive marks', () => {
		roundTrip('<p><strong>bold</strong><em>italic</em></p>')
	})
})

describe('YjsParserService - lists', () => {
	it('round-trips a bullet list', () => {
		roundTrip('<ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul>')
	})

	it('round-trips an ordered list', () => {
		roundTrip('<ol><li><p>First</p></li><li><p>Second</p></li></ol>')
	})

	it('round-trips nested lists', () => {
		roundTrip(
			'<ul><li><p>Item 1</p><ul><li><p>Nested 1</p></li><li><p>Nested 2</p></li></ul></li><li><p>Item 2</p></li></ul>',
		)
	})

	it('round-trips list items with inline marks', () => {
		roundTrip(
			'<ul><li><p>This is <strong>bold</strong> in a list</p></li><li><p>This is <em>italic</em></p></li></ul>',
		)
	})

	it('round-trips an empty list item', () => {
		roundTrip('<ul><li><p></p></li><li><p>Item 2</p></li></ul>')
	})
})

describe('YjsParserService - text style', () => {
	it('round-trips text color', () => {
		roundTrip(
			'<p><span style="color: #ff0000">red text</span></p>',
			'<p><span style="color: #ff0000;">red text</span></p>',
		)
	})

	it('round-trips font-family', () => {
		roundTrip(
			'<p><span style="font-family: Arial">arial text</span></p>',
			'<p><span style="font-family: Arial;">arial text</span></p>',
		)
	})

	it('round-trips color combined with bold', () => {
		roundTrip(
			'<p><strong><span style="color: #ff0000">bold red</span></strong></p>',
			'<p><span style="color: #ff0000;"><strong>bold red</strong></span></p>',
		)
	})

	it('round-trips color inside a list item', () => {
		roundTrip(
			'<ul><li><p><span style="color: #ff0000">colored item</span></p></li></ul>',
			'<ul><li><p><span style="color: #ff0000;">colored item</span></p></li></ul>',
		)
	})

	it('strips CSS custom properties from ThemeAwareTextStyle output', () => {
		roundTrip(
			'<p><span style="color: #000000; --text-color: #000000" data-luminance="dark">dark</span></p>',
			'<p><span style="color: #000000;">dark</span></p>',
		)
	})

	it('strips data-luminance while preserving color and font-family', () => {
		roundTrip(
			'<p><span style="color: #ffffff; font-family: Arial; --text-color: #ffffff" data-luminance="light">light</span></p>',
			'<p><span style="color: #ffffff; font-family: Arial;">light</span></p>',
		)
	})
})

describe('YjsParserService - mention nodes', () => {
	it('round-trips a mention with actor', () => {
		roundTrip(
			'<p>Mention: <span data-component-props="{&quot;actor&quot;:&quot;actor-123&quot;}" data-type="mention" data-name="Test Name"></span></p>',
			'<p>Mention: <span data-type="mention" data-name="Test Name" data-component-props="{&quot;actor&quot;:&quot;actor-123&quot;}"></span></p>',
		)
	})

	it('round-trips a mention with event', () => {
		roundTrip(
			'<p>Event: <span data-component-props="{&quot;event&quot;:&quot;event-456&quot;}" data-type="mention" data-name="Event Name"></span></p>',
			'<p>Event: <span data-type="mention" data-name="Event Name" data-component-props="{&quot;event&quot;:&quot;event-456&quot;}"></span></p>',
		)
	})

	it('round-trips a mention with article', () => {
		roundTrip(
			'<p>Article: <span data-component-props="{&quot;article&quot;:&quot;article-789&quot;}" data-type="mention" data-name="Article Name"></span></p>',
			'<p>Article: <span data-type="mention" data-name="Article Name" data-component-props="{&quot;article&quot;:&quot;article-789&quot;}"></span></p>',
		)
	})
})

describe('YjsParserService - external image nodes', () => {
	it('round-trips an external image node', () => {
		roundTrip(
			'<img data-type="embeddedImage" data-asset-id="asset-123" data-external-image-props="{&quot;sizeX&quot;:800,&quot;sizeY&quot;:600}">',
			'<img data-asset-id="asset-123" data-type="embeddedImage" data-external-image-props="{&quot;sizeX&quot;:800,&quot;sizeY&quot;:600}">',
		)
	})

	it('round-trips an external image inside a list item', () => {
		roundTrip(
			'<ul><li><p>caption</p><img data-type="embeddedImage" data-asset-id="asset-1" data-external-image-props="{}"></li></ul>',
			'<ul><li><p>caption</p><img data-asset-id="asset-1" data-type="embeddedImage" data-external-image-props="{}"></li></ul>',
		)
	})
})

describe('YjsParserService - complex documents', () => {
	it('round-trips a real-world document with mentions', () => {
		const input = [
			'<h2>Schedule</h2>',
			'<p>See <span data-component-props="{&quot;actor&quot;:&quot;9d27a335-22df-4a23-954d-f29bbed50c20&quot;}" data-type="mention" data-name="Mira Okonkwo"></span> for details</p>',
			'<ul>',
			'<li><p>Item one</p></li>',
			'<li><p>Item <strong>two</strong></p></li>',
			'</ul>',
		].join('')
		const expected = [
			'<h2>Schedule</h2>',
			'<p>See <span data-type="mention" data-name="Mira Okonkwo" data-component-props="{&quot;actor&quot;:&quot;9d27a335-22df-4a23-954d-f29bbed50c20&quot;}"></span> for details</p>',
			'<ul>',
			'<li><p>Item one</p></li>',
			'<li><p>Item <strong>two</strong></p></li>',
			'</ul>',
		].join('')
		roundTrip(input, expected)
	})
})
