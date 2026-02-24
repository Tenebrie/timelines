export class ElementPool {
	constructor() {
		setInterval(() => {
			console.log('Current pool size:', this.pool.length)
		}, 1000)
	}

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
		this.pool.push(element)
	}
}
