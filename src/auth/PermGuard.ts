import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    Logger
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { claimCheck, InsufficientScopeError } from 'express-oauth2-jwt-bearer';
import { promisify } from 'util';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly requiredPermissions: string[]) { }

    private readonly logger = new Logger(PermissionsGuard.name);

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const ctx = GqlExecutionContext.create(context);
            const req = ctx.getContext().req;

            const permissionsJwtClaim = (req.auth.payload.permissions as string[]) || [];
            this.logger.log(`Permissions in JWT: ${permissionsJwtClaim}`);
            this.logger.log(`Required permissions: ${this.requiredPermissions}`);

            const hasRequiredPermissions = this.requiredPermissions.every(
                (permission) => permissionsJwtClaim.includes(permission),
            );

            this.logger.log(`Has required permissions: ${hasRequiredPermissions}`);

            if (!hasRequiredPermissions) {
                throw new InsufficientScopeError();
            }

            // const permissionCheck = promisify(
            //     claimCheck(() => hasRequiredPermissions)
            // );

            // await permissionCheck(req.auth.payload, null);
            return true;
        } catch (error) {
            this.logger.error('Permission check failed', error.stack);
            throw new ForbiddenException('Permission denied');
        }
    }
}
