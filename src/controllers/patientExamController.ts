import {Request, Response} from 'express';
import {
    createPatientExam,
    createPatientExamWithPatient,
    deletePatientExam,
    listPatientExams,
    updateExamAttendance,
    updatePatientExam
} from '../services/patientExamService';
import {errorResponse, successResponse} from '../utils/httpResponses';
import {parseValidInt} from '../utils/parseValidInt';
import {sendExamScheduled} from './notificationController';
import {CreatePatientExamDTO, CreatePatientExamWithPatientDTO} from '../types/dto/patientExam/createPatientExamDTO';
import {ListPatientExamsDTO} from '../types/dto/patientExam/listPatientExamsDTO';
import {UpdatePatientExamDTO} from '../types/dto/patientExam/updatePatientExamDTO';
import {UpdateExamAttendanceDTO} from '../types/dto/patientExam/updateExamAttendanceDTO';
import {getExam} from "../services/tenantExamService";

export const listPatientExamsController = async (req: Request, res: Response) => {
    /*
     #swagger.tags = ['Admin/PatientExam']
     #swagger.summary = 'List Patient Exams with filters'
     #swagger.description = 'Filters by Date, CPF, Date(YYYY-MM-DD), status, Patient ID, Tenant ID)'
    */
    try {
        const tenantId = parseValidInt(req.headers['x-tenant-id'] as string);
        const patientId = parseValidInt(req.headers['x-patient-id'] as string);
        const { take, skip, patientCpf, startDate, endDate, status, patientName } = req.query;

        const filters: ListPatientExamsDTO = {
            tenantId: tenantId!,
            patientId: patientId!,
            patientCpf: patientCpf as string,
            startDate: startDate as string,
            endDate: endDate as string,
            status: status as 'Scheduled' | 'InProgress' | 'Completed',
            patientName: patientName as string,
            take: parseInt(take as string, 10) || 1000,
            skip: parseInt(skip as string, 10) || 0
        };

        const exams = await listPatientExams(filters);

        if (exams.exams.length === 0) {
            return successResponse(res, null, 'Não foram encontrados exames para essa pesquisa');
        }

        return successResponse(res, {
            exams: exams.exams,
            pagination: {
                total: exams.total,
                take: filters.take,
                skip: filters.skip,
                remaining: exams.total - exams.exams.length
            }
        }, 'Exames listados com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};
export const createPatientExamNewPatientController = async (req: Request, res: Response) => {
        /*
         #swagger.tags = ['Admin/PatientExam with New Patient']
         #swagger.summary = 'Create Patient Exam with register new patient'
         #swagger.description = 'Booking an exam for a new patient'
        */
    try {
    const tenantId = req.tenantId!;

    const examData: CreatePatientExamWithPatientDTO = { ...req.body, examDate: new Date(req.body.examDate) };

    const result = await createPatientExamWithPatient(examData, tenantId);

        try {

            const tenantExam = await getExam(examData.examId);

            if (!tenantExam || tenantExam.length === 0) {
                throw new Error('Exame não encontrado');
            }

            const examDateTime = examData.examDate.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            await sendExamScheduled({
                name: result.data.patientName!,
                phoneNumber: result.data.patientPhone!,
                tenantId,
                examDateTime: examDateTime,
                examName: tenantExam[0].exam_name
            });

        } catch (error) {
            console.error('Erro ao enviar notificação de agendamento de exame', error);
        }

        return successResponse(res, result, 'Exame do paciente criado com sucesso', 201);
    } catch (error) {
        return errorResponse(res, error);
    }
}
export const createPatientExamController = async (req: Request, res: Response) => {
    /*
     #swagger.tags = ['Admin/PatientExam']
     #swagger.summary = 'Create Patient Exam'
     #swagger.description = 'Booking an exam for a patient'
    */
    try {
        const tenantId = req.tenantId!;
        const examData: CreatePatientExamDTO = { ...req.body, examDate: new Date(req.body.examDate) };

        const result = await createPatientExam(examData, tenantId);

        try {

            const tenantExam = await getExam(examData.examId);

            if (!tenantExam || tenantExam.length === 0) {
                throw new Error('Exame não encontrado');
            }

            const examDateTime = examData.examDate.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            await sendExamScheduled({
                name: result.data.patientName!,
                phoneNumber: result.data.patientPhone!,
                tenantId,
                examDateTime: examDateTime,
                examName: tenantExam[0].exam_name
            });

        } catch (error) {
            console.error('Erro ao enviar notificação de agendamento de exame', error);
        }

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
        const tenantId = req.tenantId!;
        const examId = parseValidInt(req.params.patientExamId);
        const examData: UpdatePatientExamDTO = req.body;

        if (!examId) {
            return new Error('ID do exame é obrigatório');
        }

        const result = await updatePatientExam(examId, examData);

        // await sendExamReadyNotification({
        //     name: result.patientName!,
        //     phoneNumber: result.patientPhone!,
        //     tenantId
        // });

        return successResponse(res, 'Exame do paciente atualizado com sucesso');
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
        const tenantId = req.tenantId!;
        const examId = parseValidInt(req.params.patientExamId);
        if (!examId) {
            return new Error('ID do exame é obrigatório');
        }

        await deletePatientExam({ examId, tenantId });
        return successResponse(res, 'Exame do paciente deletado com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};

export const updateExamAttendanceController = async (req: Request, res: Response) => {
    /*
     #swagger.tags = ['Admin/PatientExam']
     #swagger.summary = 'Update Exam Attendance'
     #swagger.description = 'Update the attendance status of a patient exam'
    */
    try {
        const examId = parseValidInt(req.params.examId);
        const { attended }: UpdateExamAttendanceDTO = req.body;

        if (examId === null || attended === undefined) {
            return errorResponse(res, new Error('Dados incompletos'), 400);
        }

        const updateData: UpdateExamAttendanceDTO = { examId, attended };

        const result = await updateExamAttendance(updateData.examId, updateData.attended);
        return successResponse(res, result, 'Status de presença atualizado com sucesso');
    } catch (error) {
        return errorResponse(res, error);
    }
};

