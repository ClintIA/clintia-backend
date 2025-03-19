import { Request, Response } from 'express';
import { listLeads, createLead, updateLead, deleteLead } from '../services/leadService';
import { successResponse, errorResponse } from '../utils/httpResponses';
import { parseValidInt } from '../utils/parseValidInt';
import { CreateLeadDTO } from '../types/dto/lead/CreateLeadDTO';
import { UpdateLeadDTO } from '../types/dto/lead/UpdateLeadDTO';
import { DeleteLeadDTO } from '../types/dto/lead/DeleteLeadDTO';
import { ListLeadsDTO } from '../types/dto/lead/ListLeadsDTO';

export const listLeadsController = async (req: Request, res: Response) => {
    /*
      #swagger.tags = ['Admin/Leads']
      #swagger.summary = 'List Leads with filters'
      #swagger.description = 'Filters like name, phoneNumber, scheduled, doctorId, examId, tenantId, etc.'
    */
    try {
        const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
        const {
            name,
            callDate,
            phoneNumber,
            scheduled,
            doctorId,
            examId,
            take,
            year,
            month,
            day,
            skip } = req.query;

        const filters: ListLeadsDTO = {
            tenantId: tenantId || undefined,
            name: name as string,
            phoneNumber: phoneNumber as string,
            scheduled: scheduled === undefined ? undefined : scheduled === 'true',
            doctorId: doctorId ? parseInt(doctorId as string, 10) : undefined,
            examId: examId ? parseInt(examId as string, 10) : undefined,
            take: parseInt(take as string, 10) || 1000,
            skip: parseInt(skip as string, 10) || 0,
            callDate: callDate ? new Date(callDate as string) : undefined,
            year: year ? parseInt(year as string) : undefined,
            day: day ? parseInt(day as string) : undefined,
            month: month ? parseInt(month as string) : undefined
        };

        const leadsResult = await listLeads(filters);
        if (leadsResult.leads.length === 0) {
            return successResponse(res, null, 'Não foram encontrados leads para essa pesquisa');
        }

        return successResponse(res, {
            leads: leadsResult.leads,
            pagination: {
                total: leadsResult.total,
                take: filters.take,
                skip: filters.skip,
                remaining: leadsResult.total - leadsResult.leads.length
            }
        }, 'Leads listados com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const createLeadController = async (req: Request, res: Response) => {
    /*
      #swagger.tags = ['Admin/Leads']
      #swagger.summary = 'Create Lead'
      #swagger.description = 'Create a new lead in the system'
    */
    try {
        const tenantId = req.tenantId!;
        const leadData: CreateLeadDTO = req.body;

        const result = await createLead(leadData, tenantId);
        return successResponse(res, result, 'Lead criado com sucesso', 201);
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const updateLeadController = async (req: Request, res: Response) => {
    /*
      #swagger.tags = ['Admin/Leads']
      #swagger.summary = 'Update Lead'
      #swagger.description = 'Update an existing lead'
    */
    try {
        const leadId = parseValidInt(req.params.leadId);
        if (!leadId) {
            throw new Error('O ID do lead é obrigatório');
        }
        const leadData: UpdateLeadDTO = req.body;

        const updated = await updateLead(leadId, leadData);
        return successResponse(res, updated, 'Lead atualizado com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const deleteLeadController = async (req: Request, res: Response) => {
    /*
      #swagger.tags = ['Admin/Leads']
      #swagger.summary = 'Delete Lead'
      #swagger.description = 'Delete an existing lead from the system'
    */
    try {
        const tenantId = req.tenantId!;
        const leadId = parseValidInt(req.params.leadId);
        if (!leadId) {
            throw new Error('O ID do lead é obrigatório');
        }

        const deleteDto: DeleteLeadDTO = {
            leadId,
            tenantId
        };

        const result = await deleteLead(deleteDto);
        return successResponse(res, result, 'Lead deletado com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};