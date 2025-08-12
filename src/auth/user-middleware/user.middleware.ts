import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const username = req.header('X-Username');

        if (username) {
            req['username'] = username;
        }

        next();
    }
}
