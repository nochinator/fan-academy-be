import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * Recursively sanitize all strings in an object.
 */
function sanitize(value: any): any {
  if (typeof value === 'string') {
    return xss(value);
  } else if (Array.isArray(value)) {
    return value.map(sanitize);
  } else if (typeof value === 'object' && value !== null) {
    const sanitizedObj: Record<string, any> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        sanitizedObj[key] = sanitize(value[key]);
      }
    }
    return sanitizedObj;
  } else {
    return value;
  }
}

// Use type assertions to override readonly behavior
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  (req as any).body = sanitize(req.body);
  (req as any).query = sanitize(req.query);
  (req as any).params = sanitize(req.params);
  next();
}
