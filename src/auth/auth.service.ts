/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(CreateUserDto: CreateUserDto) {
    return this.usersService.create(CreateUserDto);
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; user: User }> {
    const { identifier, password } = loginUserDto;

    const user =
      (await this.usersService.findOneByEmail(identifier)) ||
      (await this.usersService.findOneByMobileNumber(identifier));

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const payload = {
      sub: user.id,
      email: user.email,
      mobileNumber: user.mobileno,
      password: user.passwordHash,
      name: user.name,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' }); // Short expiration
    console.log(user, 'accessToken: ', accessToken);

    return { accessToken, user };
  }

  async logout(
    req: Request,
  ): Promise<{ message: string; clearCookie: boolean }> {
    // Extract username from request. Adjust as necessary.
    let username = 'Unknown User';
    if (req['user'] && req['user'].name) {
      username = req['user'].name;
    } else if (req.body && (req.body as any).username) {
      // change req.body.username to (req.body as any).username
      username = (req.body as any).username;
    }

    //  Instead of clearing the cookie here, we just indicate that it *should* be cleared.
    return {
      message: `${username} logged out successfully`,
      clearCookie: true,
    };
  }
}
