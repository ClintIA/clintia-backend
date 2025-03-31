import {AppDataSource} from "../config/database";
import {Patient} from "../models/Patient";

export const patientRepository = AppDataSource.getRepository(Patient);