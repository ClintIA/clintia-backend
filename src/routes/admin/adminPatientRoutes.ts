import {Router} from 'express';
import {tenantMiddleware} from '../../middlewares/tenantMiddleware';
import {deletePatient, listPatients, updatePatient} from "../../controllers/patientController";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {isAdminMiddleware} from "../../middlewares/isAdminMiddleware";

const router = Router();

router.get('/patients', tenantMiddleware, authMiddleware, isAdminMiddleware, listPatients);
router.put('/patient/:patientId', tenantMiddleware, authMiddleware, isAdminMiddleware, updatePatient);
router.delete('/patient/:patientId', tenantMiddleware, authMiddleware, isAdminMiddleware, deletePatient);


export default router;
