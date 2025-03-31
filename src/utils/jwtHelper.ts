import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {TokenPayload} from '../types/interfaces/tokenPayload';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (userId: number, role: string, tenantId?: number, tenantName?: string): string => {
    const payload: TokenPayload =  { userId, tenantId: tenantId!, role, tenantName };
    
    const expiresIn = role === 'admin' ? '7d' : '3d';

    return jwt.sign(payload, JWT_SECRET!, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, JWT_SECRET!) as TokenPayload;
    } catch (error) {
        throw new Error('Invalid token');
    }
};
