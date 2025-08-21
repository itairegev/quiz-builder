import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Generate a unique request ID if not already present
    if (!req.headers['x-request-id']) {
      req.headers['x-request-id'] = this.generateRequestId();
    }

    // Add request ID to response headers for client reference
    res.setHeader('X-Request-ID', req.headers['x-request-id']);

    // Add request ID to the request object for easy access
    (req as any).requestId = req.headers['x-request-id'];

    next();
  }

  private generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `req_${timestamp}_${random}`;
  }
}
