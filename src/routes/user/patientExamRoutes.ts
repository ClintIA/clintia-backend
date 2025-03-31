import {Router} from 'express';
import {authMiddleware} from '../../middlewares/authMiddleware';
import {listPatientExamsController} from '../../controllers/patientExamController';
import {patientMiddleware} from "../../middlewares/patientMiddleware";

const router = Router();

router.get('/exams', authMiddleware, patientMiddleware, listPatientExamsController);

export default router;
