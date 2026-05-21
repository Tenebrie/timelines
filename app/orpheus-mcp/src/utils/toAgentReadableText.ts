const MENTION_SPAN_PATTERN = /<span[^>]*data-type="mention"[^>]*data-name="([^"]*)"[^>]*><\/span>/g

export function toAgentReadableText({ content }: { content: string }) {
	return content.replace(MENTION_SPAN_PATTERN, (_, name: string) => `@[${name}]`)
}
