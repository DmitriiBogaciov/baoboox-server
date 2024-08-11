import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  auth,
  InvalidTokenError,
  UnauthorizedError,
  InsufficientScopeError
} from 'express-oauth2-jwt-bearer';
import { promisify } from 'util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly requiredPermissions: string[]) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        let req: any;

        if ( context.getType() != 'http') {
          const ctx = GqlExecutionContext.create(context);
          req = ctx.getContext().req;
        } else {
          req = context.switchToHttp().getRequest<Request>();
        }

          const validateAccessToken = promisify(auth({
              issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
              audience: process.env.AUTH0_AUDIENCE,
          }));

          try {
              await validateAccessToken(req, null);
          } catch (error) {
              if (error instanceof InvalidTokenError) {
                  throw new UnauthorizedException('Bad credentials');
              }

              if (error instanceof UnauthorizedError) {
                  throw new UnauthorizedException('Requires authentication');
              }

              throw new InternalServerErrorException();
          }


          const permissionsJwtClaim = (req.auth.payload.permissions as string[]) || [];

          const hasRequiredPermissions = this.requiredPermissions.every(
              (permission) => permissionsJwtClaim.includes(permission),
          );

          if (!hasRequiredPermissions) {
              throw new InsufficientScopeError(this.requiredPermissions, `Required permissions: ${this.requiredPermissions}`);
          }
          return true;
      } catch (error) {
          throw error;
      }
  }
}