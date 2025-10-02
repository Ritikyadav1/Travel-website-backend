/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service'; 

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken =
      request.headers.authorization?.split(' ')[1] ||
      request.cookies?.accessToken; 

    if (!accessToken) {
      throw new UnauthorizedException('No access token provided');
    }

    try {
      const payload: any = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_SECRET,
      });

      //  IMPORTANT:  Now we *only* rely on the payload.
      //  We *do* go to the database to check if the user *exists*.
      //  Attach the user object to the request.
      const user = await this.usersService.findOne(payload.sub); // Use UsersService

      if (!user) {
        throw new UnauthorizedException('User not found'); //  Crucial:  Check for user existence
      }
      request['user'] = user;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else {
        console.error('JWT verification error:', error);
        throw new UnauthorizedException('Authentication failed');
      }
    }
  }
}
