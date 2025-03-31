import {Router} from 'express';
import {
    createExamController,
    deleteExamController,
    getExamsController,
    updateExamController
} from '../../controllers/tenantExamController';
import {authMiddleware} from '../../middlewares/authMiddleware';
import {tenantMiddleware} from '../../middlewares/tenantMiddleware';
import {isAdminMiddleware} from '../../middlewares/isAdminMiddleware';

const router = Router();

router.post('/tenantexam', tenantMiddleware, authMiddleware, isAdminMiddleware, createExamController);
router.get('/tenantexam', tenantMiddleware, authMiddleware, getExamsController);
router.put('/tenantexam/:clinicExamId', tenantMiddleware, authMiddleware, isAdminMiddleware, updateExamController);
router.delete('/tenantexam/:clinicExamId', tenantMiddleware, authMiddleware, isAdminMiddleware, deleteExamController);

export default router;
