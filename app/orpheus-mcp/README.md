# Orpheus MCP Server

MCP (Model Context Protocol) server for Timelines - a collaborative worldbuilding and timeline management application.

## Overview

Orpheus provides AI assistants with tools and resources to interact with Timelines worlds, actors, events, and more. It connects to the Rhea backend API using a type-safe OpenAPI client.

## Available Tools

- `list_worlds` - List all worlds the user has access to
- `get_world_details` - Get detailed information about a specific world
- `list_actors` - List all actors in a world
- `get_actor_details` - Get detailed information about a specific actor
- `list_events` - List timeline events, optionally filtered by track
- `list_event_tracks` - List all event tracks (storylines) in a world

## Available Resources

- `timelines://schema/world` - World schema documentation
- `timelines://schema/actor` - Actor schema documentation

## Development

```bash
# Install dependencies
yarn install

# Generate API types (requires Rhea backend running on localhost:3000)
yarn openapi

# Run in development mode (stdio - for Claude Desktop)
yarn start:dev

# Run in HTTP mode (for Claude Web / remote access)
yarn start:http
yarn start:http:dev  # with hot reload

# Build for production
yarn build

# Run production build
yarn prod           # stdio mode
yarn prod:http      # HTTP mode
```

## Testing

### Using MCP Inspector (Recommended)
```bash
npx @modelcontextprotocol/inspector tsx src/index.ts
```

### Using curl (HTTP mode)
```bash
# Start in HTTP mode
yarn start:http

# Health check
curl http://localhost:3001/health
```

## Configuration

Set the following environment variables:

- `TIMELINES_AUTH_TOKEN` - JWT auth token for API access
- `RHEA_URL` - Backend URL (defaults to `http://localhost:3000`)
- `MCP_TRANSPORT` - Transport mode: `stdio` (default) or `http`
- `MCP_HTTP_PORT` - HTTP server port (default: `3001`)

## Transport Modes

### stdio (Default) - Claude Desktop
For local Claude Desktop integration.

### Streamable HTTP - Claude Web / Remote
For Claude Web or remote access. Single endpoint handles all MCP communication:
- `POST /mcp` - MCP requests (with `mcp-session-id` header for sessions)
- `GET /mcp` - SSE stream for server-to-client messages
- `DELETE /mcp` - Close session
- `GET /health` - Health check

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "orpheus-timelines": {
      "command": "node",
      "args": ["/path/to/timelines/app/orpheus-mcp/dist/index.js"],
      "env": {
        "TIMELINES_AUTH_TOKEN": "your-jwt-token",
        "RHEA_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Architecture

This MCP server connects to the Rhea backend API to provide AI assistants with access to Timelines data. It follows the Greek mythology naming theme of the Timelines project (Orpheus - the legendary musician and poet).

The API client is generated from Rhea's OpenAPI spec using `openapi-typescript` and `openapi-fetch`, providing full type safety.
