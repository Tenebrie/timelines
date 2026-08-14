import { createReadStream, existsSync, statSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import http from 'node:http'
import { dirname, join, normalize, sep } from 'node:path'

/**
 * Filesystem-backed stand-in for the S3/MinIO server, implementing the
 * path-style REST subset CloudStorageService and the presigned browser
 * flows exercise. Presigned signatures and expiry are deliberately not
 * validated: the server is loopback-only and guards nothing the filesystem
 * itself doesn't. Objects live under <storageRoot>/<bucket>/<key>.
 */
export function startS3Server({ storageRoot }) {
	const server = http.createServer(async (req, res) => {
		try {
			await handleRequest(storageRoot, req, res)
		} catch (error) {
			console.error('[echo-desktop] s3 shim error:', error)
			if (!res.headersSent) res.writeHead(500)
			res.end()
		}
	})
	return new Promise((resolve, reject) => {
		server.on('error', reject)
		server.listen(9000, () => resolve(server))
	})
}

async function handleRequest(storageRoot, req, res) {
	const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname)
	const filePath = normalize(join(storageRoot, pathname))
	if (!filePath.startsWith(storageRoot + sep)) {
		res.writeHead(403)
		res.end()
		return
	}

	switch (req.method) {
		case 'PUT': {
			await mkdir(dirname(filePath), { recursive: true })
			await writeFile(filePath, await readBody(req))
			res.writeHead(200, { etag: '"echo-desktop"' })
			res.end()
			return
		}
		case 'GET':
		case 'HEAD': {
			if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
				res.writeHead(404, { 'content-type': 'application/xml' })
				res.end(req.method === 'GET' ? '<Error><Code>NoSuchKey</Code></Error>' : undefined)
				return
			}
			serveObject(filePath, req, res)
			return
		}
		case 'DELETE': {
			await rm(filePath, { force: true })
			res.writeHead(204)
			res.end()
			return
		}
		case 'POST': {
			const form = parseMultipart(await readBody(req), req.headers['content-type'] ?? '')
			if (!form || !form.fields.key || !form.file) {
				res.writeHead(400, { 'content-type': 'application/xml' })
				res.end('<Error><Code>MalformedPOSTRequest</Code></Error>')
				return
			}
			const objectPath = normalize(join(filePath, form.fields.key))
			if (!objectPath.startsWith(storageRoot + sep)) {
				res.writeHead(403)
				res.end()
				return
			}
			await mkdir(dirname(objectPath), { recursive: true })
			await writeFile(objectPath, form.file)
			res.writeHead(204)
			res.end()
			return
		}
		default:
			res.writeHead(405)
			res.end()
	}
}

function serveObject(filePath, req, res) {
	const query = new URL(req.url ?? '/', 'http://localhost').searchParams
	const size = statSync(filePath).size
	const headers = {
		'content-type': query.get('response-content-type') ?? 'application/octet-stream',
		'accept-ranges': 'bytes',
	}
	const disposition = query.get('response-content-disposition')
	if (disposition) headers['content-disposition'] = disposition

	const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/)
	const start = range ? Number(range[1]) : 0
	const end = range ? Math.min(range[2] ? Number(range[2]) : size - 1, size - 1) : size - 1

	headers['content-length'] = end - start + 1
	if (range) headers['content-range'] = `bytes ${start}-${end}/${size}`
	res.writeHead(range ? 206 : 200, headers)

	if (req.method === 'HEAD') {
		res.end()
		return
	}
	createReadStream(filePath, { start, end })
		.on('error', () => res.destroy())
		.pipe(res)
}

function readBody(req) {
	return new Promise((resolve, reject) => {
		const chunks = []
		req.on('data', (chunk) => chunks.push(chunk))
		req.on('end', () => resolve(Buffer.concat(chunks)))
		req.on('error', reject)
	})
}

/** Minimal multipart/form-data parser for the S3 presigned-post shape. */
function parseMultipart(body, contentType) {
	const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)
	if (!boundaryMatch) return null
	const boundary = Buffer.from(`--${boundaryMatch[1] ?? boundaryMatch[2]}`)

	const fields = {}
	let file = null
	let offset = body.indexOf(boundary)
	while (offset !== -1) {
		const next = body.indexOf(boundary, offset + boundary.length)
		if (next === -1) break
		const part = body.subarray(offset + boundary.length + 2, next - 2)
		const headerEnd = part.indexOf('\r\n\r\n')
		if (headerEnd !== -1) {
			const headerText = part.subarray(0, headerEnd).toString()
			const name = headerText.match(/\bname="([^"]*)"/)?.[1]
			const content = part.subarray(headerEnd + 4)
			if (name === 'file' || /\bfilename="/.test(headerText)) file = content
			else if (name) fields[name] = content.toString()
		}
		offset = next
	}
	return { fields, file }
}
