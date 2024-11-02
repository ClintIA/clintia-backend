import { Router } from 'express';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';
import { findPatientByCPFAndTenant, listPatients} from "../controllers/patientController";
import {authMiddleware} from "../middlewares/authMiddleware";
import {isAdminMiddleware} from "../middlewares/isAdminMiddleware";

const router = Router();

router.get('/',tenantMiddleware, authMiddleware, isAdminMiddleware, tenantMiddleware, listPatients);
router.get('/cpf', tenantMiddleware, authMiddleware, findPatientByCPFAndTenant);


export default router;
