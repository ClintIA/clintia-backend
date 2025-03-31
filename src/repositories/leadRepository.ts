import {AppDataSource} from "../config/database";
import {Lead} from "../models/Lead";

export const leadRepository = AppDataSource.getRepository(Lead);