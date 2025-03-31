import {Router} from "express";
import {
    countPatientByMonthController,
    createCanalController,
    examPriceController,
    countPatientExamWithFilterController,
    listCanalController,
    updateCanalController,
    deleteCanalController,
    getBudgetByTenantController,
    updateBudgetByTenantController,
    listChannelByMonthController,
    totalInvoiceByMonthController,
    totalInvoiceDoctorByMonthController,
    upsertMarketingDataController,
    getMarketingMetricsController
} from "../../controllers/marketingController";
import {tenantMiddleware} from "../../middlewares/tenantMiddleware";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {isAdminMiddleware} from "../../middlewares/isAdminMiddleware";

const router = Router();

router.get('/marketing/countPatientExam', tenantMiddleware,countPatientExamWithFilterController);
router.get('/marketing/countPatient', tenantMiddleware,countPatientByMonthController);
router.get('/marketing/countChannel', tenantMiddleware,listChannelByMonthController);
router.get('/marketing/totalInvoice', tenantMiddleware,totalInvoiceByMonthController);
router.get('/marketing/totalInvoiceDoctor', tenantMiddleware,totalInvoiceDoctorByMonthController);
router.get('/marketing/examPrice', tenantMiddleware,examPriceController);
router.get('/marketing/tenantBudget', tenantMiddleware, getBudgetByTenantController)
router.put('/marketing/tenantBudget', tenantMiddleware, updateBudgetByTenantController)
router.post('/marketing/canal',tenantMiddleware,createCanalController)
router.get('/marketing/canal', tenantMiddleware,listCanalController)
router.put('/marketing/canal', tenantMiddleware, updateCanalController)
router.delete('/marketing/canal/:id', tenantMiddleware, deleteCanalController)

router.post('/marketing/data', authMiddleware, isAdminMiddleware, tenantMiddleware, upsertMarketingDataController);
router.get('/marketing/metrics', getMarketingMetricsController);

export default router;