import {DataSource} from 'typeorm';
import {Admin} from '../models/Admin';
import {Patient} from '../models/Patient';
import {Tenant} from '../models/Tenant';
import dotenv from 'dotenv';
import {Product} from '../models/Product';
import {TenantExams} from '../models/TenantExams';
import {PatientExams} from '../models/PatientExams';
import {NoticeCard} from "../models/NoticeCard";
import {PatientClinic} from "../models/PatientClinic";
import {Doctor} from "../models/Doctor";
import {Marketing} from "../models/Marketing";
import {Lead} from "../models/Lead";

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        Admin,
        NoticeCard,
        Patient,
        PatientClinic,
        Tenant,
        Product,
        TenantExams,
        PatientExams,
        Doctor,
        Marketing,
        Lead,
    ],
    synchronize: true,
    logging: true,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const connectDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Data Source has been initialized!');
    } catch (error) {
        console.error('Error during Data Source initialization:', error);
        throw error;
    }
};
