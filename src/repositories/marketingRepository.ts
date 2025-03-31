import {AppDataSource} from "../config/database";
import {Marketing} from "../models/Marketing";

export const marketingRepository = AppDataSource.getRepository(Marketing);