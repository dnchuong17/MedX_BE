import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserDto } from '../dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() userDto: UserDto) {
    try {
      return this.userService.updateUser(id, userDto);
    } catch (error) {
      throw new Error(error);
    }
  }
}
