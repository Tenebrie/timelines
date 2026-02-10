import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

const TOOL_NAME = 'readme'

export function registerReadmeTool(server: McpServer) {
	server.registerTool(
		TOOL_NAME,
		{
			title: 'Readme',
			description: 'Provides detailed usage instructions. Run this first if you need help.',
			annotations: {
				readOnlyHint: true,
				idempotentHint: true,
			},
		},
		() => {
			const entries = [
				[
					'**Basic overview:**',
					'- This set of tools allows you to interact with Timelines, an advanced note-taking and worldbuilding app.',
					'- In Timelines you will encounter the following entities:',
					'  - Worlds are projects that contain all other entities. No cross-world communication is possible.',
					'  - Actors are characters, items, artifacts. They can typically move around, have relationships, be involved with events.',
					'  - Events are entities that happen at a specific point in time. They ALWAYS have a timestamp, and they may also have duration or end date.',
					'  - Articles are just text documents with anything that you would like to store there.',
					'  - Tags are labels you can mention in actor/article content to create queryable groupings.',
					'  - Pages are extra hidden pages of content for the entity. Query and update pages separately. Trying to create a page that does not exist will create it.',
					'',
					'**Principles:**',
					'- Names over IDs. Use human readable names to find or create entities. Avoid slugs. Only mentions are exception.',
					'- Fuzzy matching. A unique partial string match is sufficient to find an entity.',
					'- Timestamps are number of minutes since the origin time of the world (default - Jan 1st, 2023).',
					'',
					'**Getting started:**',
					'1. Use the `list_worlds` tool to see available worlds.',
					'2. Use the `set_context` tool to select a world to work in, if necessary.',
					'3. Use `get_world_details` tool to query the current world state.',
					'',
					'**Main tools:**',
					'- `search_world`: Find string matches across names and descriptions.',
					'- `get_actor_details`: Fetch details about a specific actor.',
					'- `update_actor_content`: Update main content or pages for the actor.',
				],
			]

			return {
				content: entries.map((entry) => ({
					type: 'text' as const,
					text: entry.join('\n'),
				})),
			}
		},
	)
}
