import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import chalk from 'chalk'
import http from 'http'

import { ContextService } from './services/ContextService.js'
import { OAuthService } from './services/OAuthService.js'
import { registerCreateActorTool } from './tools/actor/createActor.tool.js'
import { registerDeleteActorTool } from './tools/actor/deleteActor.tool.js'
import { registerDeleteActorContentPageTool } from './tools/actor/deleteActorContentPage.tool.js'
import { registerGetActorDetailsTool } from './tools/actor/getActorDetails.tool.js'
import { registerUpdateActorTool } from './tools/actor/updateActor.tool.js'
import { registerUpdateActorContentTool } from './tools/actor/updateActorContent.tool.js'
import { registerCreateArticleTool } from './tools/article/createArticle.tool.js'
import { registerDeleteArticleTool } from './tools/article/deleteArticle.tool.js'
import { registerGetArticleDetailsTool } from './tools/article/getArticleDetails.tool.js'
import { registerUpdateArticleTool } from './tools/article/updateArticle.tool.js'
import { registerGetContextTool } from './tools/context/getContext.tool.js'
import { registerSetContextTool } from './tools/context/setContext.tool.js'
import { registerCreateEventTool } from './tools/event/createEvent.tool.js'
import { registerDeleteEventTool } from './tools/event/deleteEvent.tool.js'
import { registerGetEventDetailsTool } from './tools/event/getEventDetails.tool.js'
import { registerUpdateEventTool } from './tools/event/updateEvent.tool.js'
import { registerCreateTagTool } from './tools/tag/createTag.tool.js'
import { registerDeleteTagTool } from './tools/tag/deleteTag.tool.js'
import { registerGetTagDetailsTool } from './tools/tag/getTagDetails.tool.js'
import { registerUpdateTagTool } from './tools/tag/updateTag.tool.js'
import { registerCreateWorldTool } from './tools/world/createWorld.tool.js'
import { registerGetWorldDetailsTool } from './tools/world/getWorldDetails.tool.js'
import { registerListWorldsTool } from './tools/world/listWorlds.tool.js'
import { registerSearchWorldTool } from './tools/world/searchWorld.tool.js'
import {
	handleAuthorize,
	handleAuthorizePost,
	handleOAuthMetadata,
	handleRegister,
	handleToken,
	validateBearerToken,
} from './utils/oauthHandlers.js'

function createServer() {
	const server = new McpServer(
		{
			name: 'orpheus-mcp',
			version: '0.0.1',
		},
		{
			instructions: `
		1. Use the \`list_worlds\` tool to see available worlds.
		2. Use the \`set_context\` tool to select a world to work in.
		3. Use other tools to interact with the selected world. 

		Basic overview:
		- Actors are characters, items, artifacts. They can typically move around, have relationships, be involved with events.
		- Events are entities that happen at a specific point in time. They ALWAYS have a timestamp, and they may also have duration or end date.
		- Articles (Wiki articles) are just text documents with anything that you would like to store there.
		- Tags are labels that attach to actors, events or articles to group or organize them.
		`,
		},
	)

	// Context tools
	registerListWorldsTool(server)
	registerCreateWorldTool(server)
	registerGetWorldDetailsTool(server)
	registerSearchWorldTool(server)
	registerSetContextTool(server)
	registerGetContextTool(server)

	// Actor tools
	registerGetActorDetailsTool(server)
	registerCreateActorTool(server)
	registerUpdateActorTool(server)
	registerUpdateActorContentTool(server)
	registerDeleteActorTool(server)
	registerDeleteActorContentPageTool(server)

	// Event tools
	registerGetEventDetailsTool(server)
	registerCreateEventTool(server)
	registerUpdateEventTool(server)
	registerDeleteEventTool(server)

	// Article tools
	registerGetArticleDetailsTool(server)
	registerCreateArticleTool(server)
	registerUpdateArticleTool(server)
	registerDeleteArticleTool(server)

	// Tag tools
	registerGetTagDetailsTool(server)
	registerCreateTagTool(server)
	registerUpdateTagTool(server)
	registerDeleteTagTool(server)

	return server
}

async function main() {
	// Track active transports by session ID
	const transports = new Map<string, StreamableHTTPServerTransport>()

	const httpServer = http.createServer(async (req, res) => {
		const url = new URL(req.url || '/', `http://localhost:3002`)

		// CORS headers for web access
		res.setHeader('Access-Control-Allow-Origin', '*')
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id, Authorization')
		res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id')

		if (req.method === 'OPTIONS') {
			res.writeHead(204)
			res.end()
			return
		}

		// OAuth 2.1 endpoints for Claude.ai remote MCP connection
		if (url.pathname === '/.well-known/oauth-authorization-server') {
			handleOAuthMetadata(req, res)
			return
		}

		// Dynamic Client Registration (RFC 7591)
		if (url.pathname === '/register' && req.method === 'POST') {
			await handleRegister(req, res)
			return
		}

		// Authorization endpoint
		if (url.pathname === '/authorize') {
			if (req.method === 'GET') {
				handleAuthorize(req, res)
			} else if (req.method === 'POST') {
				await handleAuthorizePost(req, res)
			}
			return
		}

		// Token endpoint
		if (url.pathname === '/token' && req.method === 'POST') {
			await handleToken(req, res)
			return
		}

		if (url.pathname === '/mcp') {
			// Validate OAuth token if required
			let authenticatedUserId: string | null = null
			if (OAuthService.loginEnforced()) {
				authenticatedUserId = validateBearerToken(req)
				if (!authenticatedUserId) {
					res.writeHead(401, { 'Content-Type': 'application/json' })
					res.end(JSON.stringify({ error: 'unauthorized', error_description: 'Valid Bearer token required' }))
					return
				}
				console.info(`Authenticated request from user: ${authenticatedUserId}`)
			}

			const sessionId = req.headers['mcp-session-id'] as string | undefined

			// If we have a session ID, try to find existing transport
			if (sessionId && transports.has(sessionId)) {
				const transport = transports.get(sessionId)!
				await transport.handleRequest(req, res)
				return
			}

			// For new sessions (POST without session ID = initialize)
			if (req.method === 'POST' && !sessionId) {
				const transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => crypto.randomUUID(),
					onsessioninitialized: (newSessionId) => {
						transports.set(newSessionId, transport)
						console.info(`New session initialized: ${newSessionId}`)

						// Set the authenticated user ID for this session
						if (authenticatedUserId) {
							ContextService.setCurrentUserId(newSessionId, authenticatedUserId)
							console.info(`Session ${newSessionId} linked to user: ${authenticatedUserId}`)
						}
					},
				})

				// Clean up on close
				transport.onclose = () => {
					const sid = Array.from(transports.entries()).find(([, t]) => t === transport)?.[0]
					if (sid) {
						transports.delete(sid)
						console.info(`Session closed: ${sid}`)
					}
				}

				// Create a new server instance for this session
				const server = createServer()
				await server.connect(transport)
				await transport.handleRequest(req, res)
				return
			}

			// Session ID required but not found
			res.writeHead(400, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ error: 'Invalid or missing session ID' }))
		} else if (url.pathname === '/health') {
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ status: 'ok', transport: 'streamable-http', sessions: transports.size }))
		} else {
			res.writeHead(404, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ error: 'Not found' }))
		}
	})

	httpServer.listen(3002, () => {
		const endpoints = ['http://localhost:3002/mcp', 'http://orpheus:3002/mcp']
		console.info(`${chalk.greenBright('[Orpheus]')} Listening on port ${chalk.blueBright('3002')}`)
		console.info(`  MCP endpoints: ${chalk.blueBright(endpoints[0])} | ${chalk.blueBright(endpoints[1])}`)
		console.info(`  OAuth required: ${chalk.cyan(OAuthService.loginEnforced())}`)
	})
}

main().catch((error) => {
	console.error('Fatal error:', error)
	process.exit(1)
})
