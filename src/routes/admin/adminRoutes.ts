import {Router} from 'express';
import {isAdminMiddleware} from '../../middlewares/isAdminMiddleware';
import {
    deleteAdminController,
    getAdminListController,
    getAdminsByCPFController,
    getAdminsByIDController,
    getAdminsByNameController,
    updateAdminController
} from "../../controllers/adminController";
import {tenantMiddleware} from "../../middlewares/tenantMiddleware";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {registerAdminController, registerPatientController} from "../../controllers/authController";

const router = Router();

router.get('/', getAdminListController);
router.get('/cpf', tenantMiddleware, authMiddleware, isAdminMiddleware, getAdminsByCPFController);
router.get('/adminId', tenantMiddleware, authMiddleware, isAdminMiddleware, getAdminsByIDController);
router.get('/name', tenantMiddleware, authMiddleware, isAdminMiddleware, getAdminsByNameController);
router.post('/', tenantMiddleware, authMiddleware, isAdminMiddleware, registerAdminController);
router.post('/register/patient', authMiddleware, isAdminMiddleware, tenantMiddleware, registerPatientController);
router.put('/:id', tenantMiddleware, authMiddleware, isAdminMiddleware, updateAdminController);
router.delete('/:id', tenantMiddleware, authMiddleware, isAdminMiddleware, deleteAdminController);


export default router;