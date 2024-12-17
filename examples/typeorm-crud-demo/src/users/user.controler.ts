import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { UserProfileDto } from './vo/findUser.dto';
import { BaseSignUpByEmailRequest } from './vo/sign-up.dto';
// import { BaseSignUpByEmailRequest } from './vo/sign-up.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Get('createUser')
  async createUser() {
    console.log('createUser___________________________________________');
    return this.usersService.createUser();
    // return 'hello createUser';
  }

  @Post('createUserByEmail')
  async createUserByEmail(@Body() request: BaseSignUpByEmailRequest) {
    return this.usersService.createUserByEmail(request);
  }

  @Post('findOneByEmail')
  async findOneByEmail(@Body() request: UserProfileDto) {
    return this.usersService.findOneByEmail(request.email);
  }
}
