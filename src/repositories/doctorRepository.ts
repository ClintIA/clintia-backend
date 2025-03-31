import {AppDataSource} from "../config/database";
import {Doctor} from "../models/Doctor";

export const doctorRepository = AppDataSource.getRepository(Doctor);