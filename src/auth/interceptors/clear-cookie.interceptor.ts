/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response as ExpressResponse } from 'express'; // Import Express's Response

@Injectable()
export class ClearCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const res = httpContext.getResponse<ExpressResponse>(); // Use ExpressResponse

    return next.handle().pipe(
      tap((data) => {
        //  Check the response from the service
        if (data && data.clearCookie) {
          res.clearCookie('accessToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            path: '/',
          });
        }
      }),
    );
  }
}
