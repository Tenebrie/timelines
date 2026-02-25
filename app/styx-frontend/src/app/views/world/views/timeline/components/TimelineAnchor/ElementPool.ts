export class ElementPool {
	private pool: HTMLDivElement[] = []

	rent(): HTMLDivElement {
		if (this.pool.length > 0) {
			return this.pool.pop()!
		}
		const element = document.createElement('div')
		return element
	}

	release(element: HTMLDivElement) {
		element.parentNode?.removeChild(element)
		if (this.pool.length < 100) {
			this.pool.push(element)
		}
	}
}
