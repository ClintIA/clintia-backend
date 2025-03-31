import {Router} from 'express';
import {findPatientByCPF, findPatientByPhone} from "../../controllers/patientController";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {patientMiddleware} from "../../middlewares/patientMiddleware";

const router = Router();

router.get('/cpf', authMiddleware, patientMiddleware, findPatientByCPF);
router.get('/phone', authMiddleware, findPatientByPhone);

export default router;
