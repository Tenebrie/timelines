import { Client } from '@modelcontextprotocol/sdk/client'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export async function setupMockClient(registerTools: (server: McpServer) => void) {
	const mcpServer = new McpServer({ name: 'test-server', version: '0.0.1' })
	registerTools(mcpServer)

	const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
	await mcpServer.connect(serverTransport)

	const client = new Client({ name: 'test-client', version: '0.0.1' })
	await client.connect(clientTransport)

	return client
}
