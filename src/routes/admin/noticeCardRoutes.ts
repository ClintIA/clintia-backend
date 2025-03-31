import {Router} from "express";
import {isAdminMiddleware} from "../../middlewares/isAdminMiddleware";
import {tenantMiddleware} from "../../middlewares/tenantMiddleware";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {
    createCardController,
    deleteCardController,
    listNoticeCardController
} from "../../controllers/noticeCardController";


const router = Router();

router.post('/noticecard',authMiddleware, isAdminMiddleware, tenantMiddleware, createCardController)
router.get('/noticecard', authMiddleware, isAdminMiddleware, tenantMiddleware, listNoticeCardController)
router.delete('/noticecard/:cardId', authMiddleware, isAdminMiddleware, tenantMiddleware, deleteCardController)

export default router;