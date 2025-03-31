import {Router} from 'express';
import {loginController, selectTenantController} from '../../controllers/authController';

const router = Router();

router.post('/login', loginController);
router.post('/select-tenant', selectTenantController);

export default router;
