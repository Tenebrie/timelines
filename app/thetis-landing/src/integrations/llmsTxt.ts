import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { AstroIntegration } from 'astro'

export type LlmsTxtOptions = {
	/** Rendered as the H1, and as the heading of the top-level section. */
	title: string
	/** Section headings, keyed by directory route. Falls back to the route segment. */
	sectionTitles?: Record<string, string>
}

type Entry = {
	route: string
	section: string
	title: string
	description?: string
}

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ' }

const decodeEntities = (value: string) =>
	value.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, ref: string) => {
		if (!ref.startsWith('#')) {
			return NAMED_ENTITIES[ref.toLowerCase()] ?? match
		}
		const code = ref.startsWith('#x') ? parseInt(ref.slice(2), 16) : Number(ref.slice(1))
		return Number.isFinite(code) ? String.fromCodePoint(code) : match
	})

const readTag = (html: string, pattern: RegExp, group = 1) => {
	const value = html.match(pattern)?.[group]
	return value ? decodeEntities(value).replace(/\s+/g, ' ').trim() : undefined
}

/** Attribute order differs between the AstroWind and Starlight halves of the site. */
const readDescription = (html: string) =>
	html
		.match(/<meta\b[^>]*>/gi)
		?.filter((tag) => /\bname=["']description["']/i.test(tag))
		.map((tag) => readTag(tag, /\bcontent=(["'])([\s\S]*?)\1/i, 2))
		.find(Boolean)

/** Text repeated across pages is a title template or a default description, not page content. */
const repeated = <T>(values: T[]) => new Set(values.filter((value, index) => values.indexOf(value) !== index))

const titleTail = (title: string) => title.match(/\s[—|·-]\s.+$/)?.[0]

const titleCase = (segment: string) =>
	segment.replace(/(^|-)([a-z])/g, (_, separator: string, letter: string) => separator + letter.toUpperCase())

export default (options: LlmsTxtOptions): AstroIntegration => {
	let site: URL | undefined

	const readPage = (pathname: string, outDir: string) => {
		const route = pathname.replace(/^\/+|\/+$/g, '')
		const file = path.join(outDir, route, 'index.html')
		if (!fs.existsSync(file)) {
			return undefined
		}

		const html = fs.readFileSync(file, 'utf8')
		const title = readTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
		return title ? { route, title, description: readDescription(html) } : undefined
	}

	const heading = (section: string) =>
		options.sectionTitles?.[section] ??
		(section ? titleCase(section.slice(section.lastIndexOf('/') + 1)) : options.title)

	return {
		name: 'llms-txt',
		hooks: {
			'astro:config:done': ({ config }) => {
				site = config.site ? new URL(config.base, config.site) : undefined
			},

			'astro:build:done': ({ dir, pages, logger }) => {
				if (!site) {
					logger.warn('Skipping `llms.txt`: no `site` configured.')
					return
				}

				const outDir = fileURLToPath(dir)
				const found = pages
					.map(({ pathname }) => readPage(pathname, outDir))
					.filter((page) => page !== undefined)
					.sort((a, b) => a.route.localeCompare(b.route))

				const templates = repeated(found.map((page) => titleTail(page.title)))
				const defaults = repeated(found.map((page) => page.description))

				const entries = found.map<Entry>((page) => {
					const tail = titleTail(page.title)
					return {
						route: page.route,
						section: page.route.slice(0, Math.max(page.route.lastIndexOf('/'), 0)),
						title: tail && templates.has(tail) ? page.title.slice(0, -tail.length) : page.title,
						description: defaults.has(page.description) ? undefined : page.description,
					}
				})

				// A page that other pages sit under heads its own section instead of the parent's.
				const sections = new Set(entries.map((entry) => entry.section))
				const grouped = new Map<string, Entry[]>()
				entries.forEach((entry) => {
					const section = sections.has(entry.route) ? entry.route : entry.section
					grouped.set(section, [...(grouped.get(section) ?? []), entry])
				})

				const summary = [...defaults].find((description) => description !== undefined)
				const document = [
					`# ${options.title}`,
					...(summary ? [`> ${summary}`] : []),
					...[...grouped].map(([section, links]) =>
						[
							`## ${heading(section)}`,
							'',
							...links.map(
								(link) =>
									`- [${link.title}](${new URL(link.route, site).href})${link.description ? `: ${link.description}` : ''}`,
							),
						].join('\n'),
					),
				].join('\n\n')

				fs.writeFileSync(path.join(outDir, 'llms.txt'), `${document}\n`, 'utf8')
				logger.info('`llms.txt` created at `dist`')
			},
		},
	}
}
