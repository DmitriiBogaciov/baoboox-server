import { ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { verify, JsonWebTokenError } from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(GqlAuthGuard.name);

  getRequest(context: ExecutionContext) {
    this.logger.log('Getting request from context');
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    this.logger.log('Request Headers:', request.headers);
    this.logger.log('Request Body:', request.body);
    this.logger.log('Request Params:', request.params);
    return request;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log('canActivate called');
    const request = this.getRequest(context);
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      this.logger.error('No Authorization header');
      throw new UnauthorizedException('No Authorization header');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decodedToken = await this.verifyToken(token);
      this.logger.log('Decoded Token:', decodedToken);
      return true;
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      throw new UnauthorizedException('Token verification failed');
    }
  }

  handleRequest(err: any, user: any, info: any, context: any) {
    this.logger.log('handleRequest called');
    if (err || !user) {
      this.logger.error('Error:', err);
      this.logger.error('Info:', info);
      this.logger.error('Context:', context);
      throw err || new UnauthorizedException();
    }
    this.logger.log('User:', user);
    return user;
  }

  private verifyToken(token: string): Promise<any> {
    const client = jwksRsa({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    });

    return new Promise((resolve, reject) => {
      client.getSigningKey(this.getKeyId(token), (err, key) => {
        if (err) {
          return reject(err);
        }

        const signingKey = key.getPublicKey();
        verify(token, signingKey, { algorithms: ['RS256'] }, (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded);
        });
      });
    });
  }

  private getKeyId(token: string): string {
    const decoded = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
    return decoded.kid;
  }
}
