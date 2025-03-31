import {Request, Response} from 'express';
import {createExam, deleteExam, getExams, updateExam} from '../services/tenantExamService';
import {errorResponse, successResponse} from '../utils/httpResponses';
import {CreateExamDTO} from '../types/dto/tenantExam/createExamDTO';
import {UpdateExamDTO} from '../types/dto/tenantExam/updateExamDTO';

export const createExamController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/TenantExam']
    #swagger.summary = 'Create an Exam'
    #swagger.description = 'Route to create an exam'
    */
    try {
        const { exam_name, price, doctorPrice, doctors, exam_type } = req.body;
        const tenantId = req.tenantId!;

        const examData: CreateExamDTO = { exam_name, price, exam_type,doctorPrice, tenantId, doctors };
        const result = await createExam(examData);
        return successResponse(res, result, 'Exame criado com sucesso', 201);
    } catch (error) {
        return errorResponse(res, error);
    }
};


export const getExamsController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/TenantExam']
    #swagger.summary = 'List All Exams by Tenant'
    #swagger.description = 'Route to list all exams'
    */
    try {
        const tenantId = req.tenantId!;

        const result = await getExams(tenantId);
        return successResponse(res, result, 'Exames listados com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const updateExamController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/TenantExam']
    #swagger.summary = 'Update an Exam'
    #swagger.description = 'Route to update an exam'
    */
    try {
        const examId = parseInt(req.params.clinicExamId);
        const { exam_name, exam_type, price, doctorPrice, doctors } = req.body;
        const tenantId = req.tenantId!;

        const examData: UpdateExamDTO = { exam_name, exam_type, price, doctorPrice, tenantId, doctors };
        const result = await updateExam(examId, examData);
        return successResponse(res, result );
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const deleteExamController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/TenantExam']
    #swagger.summary = 'Delete an Exam'
    #swagger.description = 'Route to delete an exam'
    */
    try {
        const examId = parseInt(req.params.clinicExamId);
        const tenantId = req.tenantId!;
        await deleteExam(examId, tenantId);
        return successResponse(res, { message: 'Exame deletado com sucesso' });
    } catch (error) {
        return errorResponse(res, error);
    }
};
