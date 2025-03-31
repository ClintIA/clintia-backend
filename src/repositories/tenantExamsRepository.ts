import {TenantExams} from '../models/TenantExams';
import {AppDataSource} from '../config/database';

export const tenantExamsRepository = AppDataSource.getRepository(TenantExams);
