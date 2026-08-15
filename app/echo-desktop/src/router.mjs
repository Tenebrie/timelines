import { createReadStream, existsSync, statSync } from 'node:fs'
import http from 'node:http'
import net from 'node:net'
import { extname, join, normalize, sep } from 'node:path'

/**
 * Local stand-in for the Gatekeeper nginx: Styx static build with SPA
 * fallback, `/api` and `/bucket` proxies, `/live` WebSocket splice. Route
 * prefixes mirror app/gatekeeper-proxy/nginx/default.conf — a new top-level
 * location there needs a matching branch here.
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
	// Under the SPA fallback the Google sign-in iframe would recursively embed
	// the whole app and steal focus — serve an inert page instead
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

const ORPHEUS_PREFIXES = ['/mcp', '/orpheus', '/.well-known/oauth-authorization-server', '/authorize', '/token', '/register']

export function startRouter({
	staticRoot,
	port,
	rheaPort,
	calliopePort,
	orpheusPort,
	bucketPort,
	host = '127.0.0.1',
	fallbackToRandomPort = false,
}) {
	const server = http.createServer((req, res) => {
		const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
		if (hasPrefix(pathname, '/api') || pathname === '/health') {
			proxyHttp(req, res, rheaPort)
		} else if (hasPrefix(pathname, '/calliope')) {
			proxyHttp(req, res, calliopePort)
		} else if (ORPHEUS_PREFIXES.some((prefix) => hasPrefix(pathname, prefix))) {
			proxyHttp(req, res, orpheusPort)
		} else if (hasPrefix(pathname, '/bucket')) {
			proxyHttp(req, res, bucketPort)
		} else {
			serveStatic(staticRoot, pathname, res)
		}
	})

	server.on('upgrade', (req, clientSocket, head) => {
		if (!hasPrefix(new URL(req.url ?? '/', 'http://localhost').pathname, '/live')) {
			clientSocket.destroy()
			return
		}
		const upstreamSocket = net.connect(calliopePort, '127.0.0.1', () => {
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
		server.on('error', (error) => {
			if (error.code === 'EADDRINUSE' && fallbackToRandomPort) {
				console.warn(`[echo-desktop] port ${port} is taken, picking a random free port`)
				server.listen(0, host)
				return
			}
			reject(error)
		})
		server.listen(port, host, () => resolve(server))
	})
}

function hasPrefix(pathname, prefix) {
	return pathname === prefix || pathname.startsWith(prefix + '/')
}
