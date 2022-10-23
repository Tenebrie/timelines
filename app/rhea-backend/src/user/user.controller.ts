import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { Cat } from './cat.entity'

@Controller('/user')
export class UserController {
	@Get('/')
	getUser(): string {
		return 'This is the user, trust me'
	}

	@Get('/:id')
	@ApiResponse({
		status: 200,
		type: Cat,
	})
	getTestData(@Param('id', new ParseIntPipe()) id: number): Cat {
		const cat = new Cat()
		cat.age = id
		return cat
	}
}
