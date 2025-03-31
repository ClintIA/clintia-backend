import {NextFunction, Request, Response} from 'express';
import {errorResponse} from '../utils/httpResponses';

export const patientMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const patientId = req.headers['x-patient-id'];

    if (!patientId) {
        return errorResponse(res, new Error('Patient ID is required'), 400);
    }

    req.patientId = parseInt(patientId as string);
    next();
};
