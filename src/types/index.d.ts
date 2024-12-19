import { Request } from 'express';
import {ProfileRole} from "./enums/ProfileRole";

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
