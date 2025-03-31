import {Router} from 'express';
import {authMiddleware} from '../../middlewares/authMiddleware';
import {tenantMiddleware} from '../../middlewares/tenantMiddleware';
import {isAdminMiddleware} from '../../middlewares/isAdminMiddleware';

import {
    createLeadController,
    deleteLeadController,
    listLeadsController,
    updateLeadController
} from '../../controllers/leadController';

const router = Router();

router.post('/leads', tenantMiddleware, authMiddleware, isAdminMiddleware, createLeadController);
router.get('/leads', tenantMiddleware, authMiddleware, isAdminMiddleware, listLeadsController);
router.put('/leads/:leadId', tenantMiddleware, authMiddleware, isAdminMiddleware, updateLeadController);
router.delete('/leads/:leadId', tenantMiddleware, authMiddleware, isAdminMiddleware, deleteLeadController);

export default router;
