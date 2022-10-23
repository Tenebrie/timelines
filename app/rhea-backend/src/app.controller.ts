import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello()
	}

	@Get('/test/data')
	getTestData(): { a: string; b: string } {
		return {
			a: '1',
			b: '5',
		}
	}
}
