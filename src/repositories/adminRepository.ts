import {AppDataSource} from "../config/database";
import {Admin} from "../models/Admin";

export const adminRepository = AppDataSource.getRepository(Admin);