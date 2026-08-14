import { createReadStream, existsSync, statSync } from 'node:fs'
import http from 'node:http'
import net from 'node:net'
import { extname, join, normalize, sep } from 'node:path'

/**
 * Local stand-in for the Gatekeeper nginx: serves the Styx static build with
 * SPA fallback and proxies the same URL contract the frontend expects —
 * `/api` to Rhea, `/live` (WebSocket) to Calliope. The SPA derives both its
 * API base and WebSocket URLs from window.location, so serving everything
 * from one 127.0.0.1 origin makes the client work without configuration.
 *
 * The route prefixes mirror app/gatekeeper-proxy/nginx/default.conf — a new
 * top-level location added there needs a matching branch here.
 */
const MIME_TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.map': 'application/json',
	'.txt': 'text/plain; charset=utf-8',
	'.webmanifest': 'application/manifest+json',
	'.wasm': 'application/wasm',
}

const RHEA_PORT = 3000
const CALLIOPE_PORT = 3001

function proxyHttp(req, res, targetPort) {
	const upstream = http.request(
		{
			host: '127.0.0.1',
			port: targetPort,
			method: req.method,
			path: req.url,
			headers: req.headers,
		},
		(upstreamRes) => {
			res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers)
			upstreamRes.pipe(res)
		},
	)
	upstream.on('error', (error) => {
		if (!res.headersSent) res.writeHead(502, { 'content-type': 'application/json' })
		res.end(JSON.stringify({ error: 'Local backend unavailable', detail: error.message }))
	})
	res.on('close', () => upstream.destroy())
	req.pipe(upstream)
}

function serveStatic(staticRoot, pathname, res) {
	// In the cloud deployment this path is a real page on the marketing host
	// (Google sign-in bridge). Under the SPA fallback it would recursively
	// embed the whole app inside the login page's hidden iframe — each nested
	// copy stealing focus via autoFocus. Serve an inert page instead.
	if (pathname === '/google-signin.html') {
		res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
		res.end('<!doctype html><title>Unavailable</title><!-- Google sign-in is not available in desktop mode -->')
		return
	}
	let decoded
	try {
		decoded = decodeURIComponent(pathname)
	} catch {
		res.writeHead(400)
		res.end()
		return
	}
	let filePath = normalize(join(staticRoot, decoded))
	if (filePath !== staticRoot && !filePath.startsWith(staticRoot + sep)) {
		res.writeHead(403)
		res.end()
		return
	}
	if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
		filePath = join(staticRoot, 'index.html')
	}
	res.writeHead(200, {
		'content-type': MIME_TYPES[extname(filePath)] ?? 'application/octet-stream',
		'cache-control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600',
	})
	createReadStream(filePath)
		.on('error', () => res.destroy())
		.pipe(res)
}

export function startRouter({ staticRoot, port, host = '127.0.0.1' }) {
	const server = http.createServer((req, res) => {
		const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
		if (hasPrefix(pathname, '/api') || pathname === '/health') {
			proxyHttp(req, res, RHEA_PORT)
		} else if (hasPrefix(pathname, '/calliope')) {
			proxyHttp(req, res, CALLIOPE_PORT)
		} else if (hasPrefix(pathname, '/bucket')) {
			// Asset storage (S3/MinIO) is out of scope for desktop mode
			res.writeHead(501, { 'content-type': 'application/json' })
			res.end(JSON.stringify({ error: 'Asset storage is not available in desktop mode' }))
		} else {
			serveStatic(staticRoot, pathname, res)
		}
	})

	// Raw TCP splice for WebSocket upgrades on /live (live updates + Yjs)
	server.on('upgrade', (req, clientSocket, head) => {
		if (!hasPrefix(new URL(req.url ?? '/', 'http://localhost').pathname, '/live')) {
			clientSocket.destroy()
			return
		}
		const upstreamSocket = net.connect(CALLIOPE_PORT, '127.0.0.1', () => {
			const headerLines = [`${req.method} ${req.url} HTTP/${req.httpVersion}`]
			for (let i = 0; i < req.rawHeaders.length; i += 2) {
				headerLines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`)
			}
			upstreamSocket.write(headerLines.join('\r\n') + '\r\n\r\n')
			if (head.length > 0) upstreamSocket.write(head)
			upstreamSocket.pipe(clientSocket)
			clientSocket.pipe(upstreamSocket)
		})
		const destroyBoth = () => {
			clientSocket.destroy()
			upstreamSocket.destroy()
		}
		upstreamSocket.on('error', destroyBoth)
		clientSocket.on('error', destroyBoth)
	})

	return new Promise((resolve, reject) => {
		server.on('error', reject)
		server.listen(port, host, () => resolve(server))
	})
}

function hasPrefix(pathname, prefix) {
	return pathname === prefix || pathname.startsWith(prefix + '/')
}
