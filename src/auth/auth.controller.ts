/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserGuard } from './guards/user.guard';
import { ClearCookieInterceptor } from './interceptors/clear-cookie.interceptor';
import { setCookie } from '../utils/cookies.utils';
import type { Response, Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body(ValidationPipe) CreateUserDto: CreateUserDto,
  ): Promise<User> {
    return this.authService.signup(CreateUserDto);
  }


  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body(ValidationPipe) loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const { accessToken, user } = await this.authService.login(loginUserDto);

    // Use the setCookie utility function
    setCookie(res, 'accessToken', accessToken, {
      httpOnly: true,
      secure: false, // Set to true in production
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'strict',
      path: '/', // Set the path to the root '/'
    });

    //  Include the accessToken in the JSON response
    return {
      message: 'Login successful',
      user,
      accessToken,
    };
  }

  @Post('logout')
  @UseGuards(UserGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClearCookieInterceptor) 
  async logout(@Req() req: Request): Promise<any> {
    return await this.authService.logout(req);
  }
}
