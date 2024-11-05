import { Request, Response } from 'express';
import { listPatientExams, createPatientExam, updatePatientExam, deletePatientExam } from '../services/patientExamService';
import { successResponse, errorResponse } from '../utils/httpResponses';
import { parseValidInt } from '../utils/parseValidInt';
import {getExams} from "../services/tenantExamService";

export const listPatientExamsController = async (req: Request, res: Response) => {
    /*
     #swagger.tags = ['Admin/PatientExam']
     #swagger.summary = 'List Patient Exams with filters'
     #swagger.description = 'Filters by Date, CPF, Date(YYYY-MM-DD), status, Patient ID, Tenant ID)'
     */
    try {
        const { patientCpf, startDate, endDate, status, patientName } = req.query;
        const tenantId = req.headers['x-tenant-id'];
        const patientId = req.headers['x-patient-id'];

        const filters = {
            patientCpf: patientCpf ? patientCpf as string : undefined,
            startDate: startDate ? startDate as string : undefined,
            endDate: endDate ? endDate as string : undefined,
            status: status as 'Scheduled' | 'InProgress' | 'Completed',
            patientName: patientName as string,
            patientId: patientId ? parseInt(patientId as string) : undefined,
            tenantId: tenantId ? parseInt(tenantId as string) : undefined,
        };

        const exams = await listPatientExams(filters);

        const transformedData = exams.reduce((acc: any, exam: any) => {
            const tenantIndex = acc.findIndex((tenant: any) => tenant.id === exam.exam.tenant.id);
            
            const examData = {
                id: exam.id,
                link: exam.link,
                createdAt: exam.createdAt,
                examDate: exam.examDate,
                uploadedAt: exam.uploadedAt,
                status: exam.status,
                exam: {
                    id: exam.exam.id,
                    exam_name: exam.exam.exam_name
                }
            };

            if (tenantIndex > -1) {
                acc[tenantIndex].patientExams.push(examData);
            } else {
                acc.push({
                    id: exam.exam.tenant.id,
                    name: exam.exam.tenant.name,
                    patientExams: [examData]
                });
            }

            return acc;
        }, []);
        if(transformedData.length === 0) {
            return successResponse(res, null, 'Não foram encontrados exames para essa pesquisa');
        }
        return successResponse(res, { exames: transformedData }, 'Exames listados com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};



export const createPatientExamController = async (req: Request, res: Response) => {

    /*
    #swagger.tags = ['Admin/PatientExam']
    #swagger.summary = 'Create Patient Exam'
    #swagger.description = 'Booking a exam to a patient'
*/
    try {
        const { patientId, examId, examDate, doctorId, userId } = req.body;
        const tenantId = req.tenantId!;

        const result = await createPatientExam({ patientId, examId, examDate: new Date(examDate), userId, doctorId }, tenantId);
        return successResponse(res, result, 'Exame do paciente criado com sucesso', 201);
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const updatePatientExamController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/PatientExam']
    #swagger.summary = 'Update Patient Exam'
    #swagger.description = 'Save link and update status in exam scheduled'
    */
    try {
        const examId = parseValidInt(req.params.patientExamId);
        if (examId === null) {
            return errorResponse(res, new Error("Invalid examId: not a number"), 400);
        }
        const { status, link } = req.body;

        const result = await updatePatientExam(examId, { status, link });
        return successResponse(res, result, 'Exame do paciente atualizado com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const deletePatientExamController = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Admin/PatientExam']
    #swagger.summary = 'Delete Patient Exam'
    #swagger.description = 'Delete a Scheduled Exam'
    */
    try {
        const examId = parseValidInt(req.params.examId);
        if (examId === null) {
            return errorResponse(res, new Error("Invalid examId: not a number"), 400);
        }
        const tenantId = req.tenantId!;

        await deletePatientExam(examId, tenantId);
        return successResponse(res, 'Exame do paciente deletado com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};