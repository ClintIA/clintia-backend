import {NextFunction, Request, Response} from 'express';
import {errorResponse} from '../utils/httpResponses';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
        return errorResponse(res, new Error('Tenant ID is required'), 400);
    }

    req.tenantId = parseInt(tenantId as string);
    next();
};