import {Request, Response} from "express";
import {errorResponse, successResponse} from "../utils/httpResponses";
import {parseValidInt} from "../utils/parseValidInt";
import {
    calculateMarketingMetrics,
    countInvoicingService,
    countPatientByMonthService,
    createCanalService,
    deleteCanalService,
    examPricesService,
    getBudgetByTenantService,
    listCanalService,
    listChannelByMonthService,
    totalExamPerDoctorByMonthService,
    totalInvoicePerExamByMonthService,
    updateBudgetByTenantService,
    updateCanalService,
    upsertMarketingDataService,
} from "../services/marketingService";
import {MarketingFilters} from "../types/dto/marketing/marketingFilters";
import {MarketingDTO} from "../types/dto/marketing/marketingDTO";


export const listCanalController  = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Marketing']
    #swagger.summary = 'List Canal Marketing '
    #swagger.description = 'List Canal Marketing by tenant'
    */
    const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
    if(!tenantId) {
        throw new Error('Please, inform tenantID')
    }
    try {
        const result = await listCanalService(tenantId)
        return successResponse(res,result, 'Lista de Canais')
    } catch (error) {
        return errorResponse(res, error);
    }

}

export const createCanalController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Marketing']
    #swagger.summary = 'Create Canal Marketing '
    #swagger.description = 'Create Canal Marketing by tenant'
    */
    const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
    if(!tenantId) {
        throw new Error('Please, inform tenantID')
    }
    try {
        const newCanal: MarketingDTO = req.body

        const result = await createCanalService(newCanal,tenantId)
        return successResponse(res, result, 'Canal Registrado com Sucesso')
    } catch (error) {
        return errorResponse(res, error);
    }

}

export const updateCanalController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Marketing']
    #swagger.summary = 'Update Canal Marketing '
    #swagger.description = 'Update Canal Marketing by tenant'
    */
    const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
    if(!tenantId) {
        throw new Error('Please, inform tenantID')
    }
    try {

        const newCanal: MarketingDTO = req.body

        const result = await updateCanalService(newCanal,tenantId)
        return successResponse(res,result, 'Canal Registrado')
    } catch (error) {
        return errorResponse(res, error);
    }

}

export const deleteCanalController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Marketing']
    #swagger.summary = 'Delete Canal Marketing '
    #swagger.description = 'Delete Canal Marketing by tenant'
    */
    const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
    if(!tenantId) {
        throw new Error('Please, inform tenantID')
    }

    try {
        const canalID = parseValidInt(req.params.id);
        if(!canalID) {
            return new Error('Inform ID')
        }
        const result = await deleteCanalService(canalID)
        return successResponse(res,result, )
    } catch (error) {
        return  errorResponse(res,error)
    }
}

export const getBudgetByTenantController = async(req: Request, res: Response) => {
    /*
    #swagger.tags = ['Marketing']
    #swagger.summary = 'Get budget by tenant'
    #swagger.description = 'Get budget by tenant'
    */
    const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
    if(!tenantId) {
        throw new Error('Please, inform tenantID')
    }
    try {

        const result = await getBudgetByTenantService(tenantId)
        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);
    }
}
export const updateBudgetByTenantController = async(req: Request, res: Response) => {
    /*
    #swagger.tags = ['Marketing']
    #swagger.summary = 'Update budget by tenant'
    #swagger.description = 'Update budget by tenant'
    */
    const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
    if(!tenantId) {
        throw new Error('Please, inform tenantID')
    }
    try {
        const budget = req.body.budget
        const result = await updateBudgetByTenantService(budget,tenantId)

        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);
    }
}

export const countPatientExamWithFilterController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Marketing']
    #swagger.summary = 'Get Total Invoice by Exam, Date, Status  '
    #swagger.description = 'Get Total Invoice by exam name'
    */
    try {
        const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
        const {
            startDate,
            endDate,
            status,
            examID,
            examType,
            attended,
            exam_name,
            month,
            year,
        } = req.query;

        const filters: MarketingFilters = {
            tenantId: tenantId!,
            startDate: startDate as string,
            endDate: endDate as string,
            status: status as 'Scheduled' | 'InProgress' | 'Completed' | undefined,
            examID: parseInt(examID as string),
            examType: examType as string,
            attended: attended as string,
            exam_name: exam_name as string,
            month: month as string,
            year: year as string || new Date().getFullYear().toString()
        };

        const result = await countInvoicingService(filters);
        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const listChannelByMonthController = async (req: Request, res: Response) => {

    const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
    const filters: MarketingFilters = {
        tenantId: tenantId!,

    };
    if(!tenantId) {
        throw new Error('Tenant ID not found')
    }
    try {

        const result = await listChannelByMonthService(filters)
        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);

    }
}
export const totalInvoiceByMonthController = async (req: Request, res: Response) => {
    const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);

    if(!tenantId) {
        throw new Error('Tenant ID not found')
    }
    try {
        const {
            startDate,
            endDate,
            status,
            examID,
            examType,
            attended,
            exam_name,
            month,
            year
        } = req.query;
        const filters: MarketingFilters = {
            tenantId: tenantId,
            startDate: startDate as string,
            endDate: endDate as string,
            status: status as 'Scheduled' | 'InProgress' | 'Completed' | undefined,
            examID: parseInt(examID as string),
            examType: examType as string,
            attended: attended as string,
            exam_name: exam_name as string,
            month: month as string,
            year: year as string || new Date().getFullYear().toString()
        };
        const result = await totalInvoicePerExamByMonthService({...filters, attended: attended as string})
        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);

    }

}
export const totalInvoiceDoctorByMonthController = async (req: Request, res: Response) => {
    const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
    if(!tenantId) {
        throw new Error('Tenant ID not found')
    }
    try {
        const {
            year,
            startDate,
            endDate,
            status,
            examID,
            examType,
            attended,
            exam_name,
            month,
        } = req.query;

        const filters: MarketingFilters = {
            tenantId: tenantId,
            startDate: startDate as string,
            endDate: endDate as string,
            status: status as 'Scheduled' | 'InProgress' | 'Completed' | undefined,
            examID: parseInt(examID as string),
            examType: examType as string,
            attended: attended as string,
            exam_name: exam_name as string,
            month: month as string,
            year: year as string || new Date().getFullYear().toString()
        };
        const result = await totalExamPerDoctorByMonthService({...filters, attended: attended as string})
        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);

    }

}
export const countPatientByMonthController = async (req: Request, res: Response) => {

    const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
    const {
        startDate,
        endDate,
        gender,
        patientID,
        canal,
        month,
        year
    } = req.query;

    const filters: MarketingFilters = {
        tenantId: tenantId!,
        startDate: startDate as string,
        endDate: endDate as string,
        patientID: parseInt(patientID as string),
        canal: canal as string,
        gender: gender as string,
        month: month as string,
        year: year as string || new Date().getFullYear().toString()
    };
        if(!tenantId) {
            throw new Error('Tenant ID not found')
        }
    try {
        const result = await countPatientByMonthService(filters)
        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);

    }
}

export const examPriceController = async (req: Request, res: Response) => {

    const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
    if(!tenantId) {
        throw new Error('Tenant ID not found')
    }
    const {
        examID,
    } = req.query;
    try {
        const filters = {
            tenantId: tenantId!,
            examID: parseInt(examID as string)
        };

        const result = await examPricesService(filters)
        if(!result) {
            return errorResponse(res, 'Exame não encontrado');
        }
        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);

    }
}

export const upsertMarketingDataController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Marketing']
    #swagger.summary = 'Create or Update Marketing Data'
    #swagger.description = 'Insert or update data for a specific marketing channel'
    */
    const tenantId = parseInt(req.headers['x-tenant-id'] as string);
    const newData: MarketingDTO = req.body;

    if (!tenantId) throw new Error('Tenant ID é obrigatório');
    try {

        const result = await upsertMarketingDataService(newData, tenantId);

        return successResponse(res, result);
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const getMarketingMetricsController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Marketing']
    #swagger.summary = 'Get Marketing Metrics'
    #swagger.description = 'Retrieve calculated metrics for marketing channels'
    */

    try {
        const tenantId = parseInt(req.headers['x-tenant-id'] as string);
        const { month } = req.query;

        if (!tenantId || !month) throw new Error('Tenant ID e mês são obrigatórios');
        const result = await calculateMarketingMetrics(tenantId, month as string);

        return successResponse(res, result, 'Métricas calculadas com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};
