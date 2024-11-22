import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { listPatientExamsController, updateExamAttendanceController } from '../../controllers/patientExamController';
import {patientMiddleware} from "../../middlewares/patientMiddleware";

const router = Router();

router.get('/exams', authMiddleware, patientMiddleware, listPatientExamsController);
router.patch('/exams/attendance/:examId', authMiddleware, updateExamAttendanceController);

export default router;
