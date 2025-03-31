import {Router} from 'express';
import {authMiddleware} from '../../middlewares/authMiddleware';
import {tenantMiddleware} from '../../middlewares/tenantMiddleware';
import {isAdminMiddleware} from '../../middlewares/isAdminMiddleware';
import {
    createPatientExamController,
    createPatientExamNewPatientController,
    deletePatientExamController,
    listPatientExamsController,
    updateExamAttendanceController,
    updatePatientExamController
} from '../../controllers/patientExamController';

const router = Router();
router.post('/patientexams', tenantMiddleware, authMiddleware, isAdminMiddleware, createPatientExamController);
router.post('/patientexams/newpatient', tenantMiddleware, authMiddleware, isAdminMiddleware, createPatientExamNewPatientController);
router.get('/patientexams', authMiddleware, tenantMiddleware, isAdminMiddleware, listPatientExamsController);
router.put('/patientexams/:patientExamId', tenantMiddleware, authMiddleware, isAdminMiddleware, updatePatientExamController);
router.delete('/patientexams/:patientExamId', tenantMiddleware, authMiddleware, isAdminMiddleware, deletePatientExamController);
router.put('/patientexams/attendance/:examId', tenantMiddleware, authMiddleware, isAdminMiddleware, updateExamAttendanceController);


export default router;
