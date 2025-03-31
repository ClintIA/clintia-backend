import { Request } from 'express';

declare module 'express' {
    export interface Request {
        tenantId?: number;
        patientId?: number;
        user?: {
            userId: number;
            tenantId?: number;
            role: string;
        };
    }
}
