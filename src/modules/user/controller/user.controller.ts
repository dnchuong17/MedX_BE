import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserDto } from '../dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

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

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/email')
  async getUserByEmail(@Query('email') email: string) {
    try {
      return this.userService.UserInfoByEmail(email);
    } catch (error) {
      throw new Error(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/phone')
  async getUserByPhone(@Query('phone') phone: string) {
    try {
      return this.userService.UserInfoByPhone(phone);
    } catch (error) {
      throw new Error(error);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/wallet')
  async getUserByWallet(@Query('wallet_address') wallet_address: string) {
    try {
      return this.userService.UserInfoByWallet(wallet_address);
    } catch (error) {
      throw new Error(error);
    }
  }
}
