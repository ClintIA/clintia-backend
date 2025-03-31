import {NextFunction, Request, Response} from 'express';
import {errorResponse} from '../utils/httpResponses';

export const isAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role == 'patient') {
        return errorResponse(res, new Error('Acesso negado: Apenas administradores podem realizar esta ação'), 403);
    }
    next();
};
