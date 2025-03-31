import {AppDataSource} from "../config/database";
import {PatientExams} from "../models/PatientExams";

export const patientExamsRepository = AppDataSource.getRepository(PatientExams);