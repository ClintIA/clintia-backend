import {Request, Response} from 'express';
import {customErrorResponse, errorResponse, successResponse} from '../utils/httpResponses';
import {createCardService, deleteCardService, listNoticeCardService} from "../services/noticeCardService";
import {CreateNoticeCardDTO} from '../types/dto/noticeCard/createNoticeCardDTO';
import {DeleteNoticeCardDTO} from '../types/dto/noticeCard/deleteNoticeCardDTO';
import {ListNoticeCardFiltersDTO} from '../types/dto/noticeCard/listNoticeCardFiltersDTO';

export const listNoticeCardController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/NoticeCard']
    #swagger.summary = 'List Notices Cards'
    #swagger.description = 'Route to list all notice cards with optional filters'
    */
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return errorResponse(res, new Error('É necessário passar o tenantId'), 400);
        }

        const filters: ListNoticeCardFiltersDTO = {
            tenantId,
            startDate: req.query.startDate as string | undefined,
            endDate: req.query.endDate as string | undefined,
            message: req.query.message as string | undefined,
            createdBy: req.query.createdBy ? parseInt(req.query.createdBy as string) : undefined,
        };

        const messageCards = await listNoticeCardService(filters);
        return successResponse(res, messageCards, 'Lista de mensagens para o Mural de avisos');
    } catch (error) {
        return errorResponse(res, error);
    }
}

export const createCardController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/NoticeCard']
    #swagger.summary = 'Create a Notice Card'
    #swagger.description = 'Route to create a notice card'
    */
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            return customErrorResponse(res, 'Tenant ID is required');
        }

        const cardData: CreateNoticeCardDTO = req.body;

        if (!cardData.message || !cardData.createdBy || !cardData.date) {
            return customErrorResponse(res, 'Dados incompletos');
        }

        const result = await createCardService(cardData, tenantId);
        return successResponse(res, result, "Aviso Registrado com sucesso");
    } catch (error) {
        return errorResponse(res, error);
    }
}

export const deleteCardController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/NoticeCard']
    #swagger.summary = 'Delete a Notice Card'
    #swagger.description = 'Route to delete a notice card'
    */
    try {
        const { cardId } = req.params;
        if (!cardId) {
            return errorResponse(res, "Dados incompletos", 400);
        }

        const deleteParams: DeleteNoticeCardDTO = { cardId: parseInt(cardId) };
        const result = await deleteCardService(deleteParams);

        return successResponse(res, result, "Aviso Deletado");
    } catch (error) {
        return errorResponse(res, error);
    }
}
