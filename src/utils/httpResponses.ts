import {Response} from 'express';

export const successResponse = (res: Response, data: any, message: string = 'Success', statusCode: number = 200) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data
    });
};

export const errorResponse = (res: Response, error: unknown, statusCode: number = 400) => {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(statusCode).json({
        status: 'error',
        message: errorMessage
    });
};
export const customErrorResponse = (res: Response, error: string, statusCode: number = 400) => {
    return res.status(statusCode).json({
        status: 'error',
        message: error
    });
};

export const notFoundResponse = (res: Response, message: string = 'Resource not found') => {
    return res.status(404).json({
        status: 'error',
        message
    });
};

export const unauthorizedResponse = (res: Response, message: string = 'Unauthorized access') => {
    return res.status(401).json({
        status: 'error',
        message
    });
};
