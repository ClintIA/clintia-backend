import {AppDataSource} from '../config/database';
import {Tenant} from '../models/Tenant';

export const tenantRepository = AppDataSource.getRepository(Tenant);